from app.domain.models.match_detail import (
    MatchDetail, InningScorecard, BatsmanStats, BowlerStats, PlayerInfo, FallOfWicket, BallLog
)

def normalize_match_detail(raw: dict) -> MatchDetail:
    data = raw.get("data", raw)
    
    # 1. Build Teams Map
    teams_map = {}
    if data.get("localteam"): teams_map[data.get("localteam_id")] = data.get("localteam", {}).get("name")
    if data.get("visitorteam"): teams_map[data.get("visitorteam_id")] = data.get("visitorteam", {}).get("name")

    # 2. Build Player Map
    player_map = {}
    home_id = data.get("localteam_id")
    home_squad, away_squad = [], []

    for p in data.get("lineup", []):
        p_info = PlayerInfo(
            id=p["id"],
            name=p.get("fullname", "Unknown"),
            image=p.get("image_path"),
            position=p.get("position", {}).get("name") if p.get("position") else None,
            is_captain=p.get("lineup", {}).get("captain", False),
            is_keeper=p.get("lineup", {}).get("wicketkeeper", False)
        )
        player_map[p["id"]] = p_info
        if p.get("lineup", {}).get("team_id") == home_id:
            home_squad.append(p_info)
        else:
            away_squad.append(p_info)

    # 3. Helper for Innings
    innings_map = {} 

    def get_inning(scoreboard_id, team_id):
        if not scoreboard_id: scoreboard_id = "S1"
        if scoreboard_id not in innings_map:
            t_name = teams_map.get(team_id, "Unknown Team")
            innings_map[scoreboard_id] = InningScorecard(
                inning_number=int(scoreboard_id.replace("S", "")) if "S" in scoreboard_id else 1,
                team_id=team_id,
                team_name=t_name,
                score="0/0", overs="0.0",
                batting=[], bowling=[], fow=[], recent_balls=[], extras=0
            )
        return innings_map[scoreboard_id]

    # 4. Batting Stats (With Dismissal Text)
    for b in data.get("batting", []):
        inning = get_inning(b.get("scoreboard"), b.get("team_id"))
        status = "batting" if b.get("active") else "out"
        
        # --- Dismissal Logic ---
        dismissal_txt = ""
        if status == "out":
            catcher_id = b.get("catch_stump_player_id")
            bowler_id = b.get("bowling_player_id")
            
            # Safe lookup for names
            catcher = player_map[catcher_id].name if catcher_id in player_map else None
            bowler = player_map[bowler_id].name if bowler_id in player_map else None
            
            if catcher and bowler:
                dismissal_txt = f"c {catcher} b {bowler}"
            elif bowler:
                dismissal_txt = f"b {bowler}"
            elif b.get("score_id") == 4: 
                dismissal_txt = "Run Out"
        
        # --- FIX: Added image=None, position=None to fallback ---
        player_obj = player_map.get(b["player_id"], PlayerInfo(
            id=b["player_id"], name="Unknown", image=None, position=None
        ))
        
        inning.batting.append(BatsmanStats(
            player=player_obj,
            runs=b.get("score", 0),
            balls=b.get("ball", 0),
            fours=b.get("four_x", 0),
            sixes=b.get("six_x", 0),
            strike_rate=b.get("rate", 0.0),
            status=status,
            dismissal_text=dismissal_txt
        ))

    # 5. Bowling Stats
    for b in data.get("bowling", []):
        inning = get_inning(b.get("scoreboard"), 0) 
        
        # --- FIX: Added image=None, position=None to fallback ---
        player_obj = player_map.get(b["player_id"], PlayerInfo(
            id=b["player_id"], name="Unknown", image=None, position=None
        ))
        
        inning.bowling.append(BowlerStats(
            player=player_obj,
            overs=b.get("overs", 0.0),
            runs_conceded=b.get("runs", 0),
            wickets=b.get("wickets", 0),
            economy=b.get("rate", 0.0)
        ))

    # 6. Balls & FOW Logic
    raw_balls = sorted(data.get("balls", []), key=lambda x: (x.get("scoreboard"), x.get("id")))
    inning_running_score = {} 

    for ball in raw_balls:
        sc_id = ball.get("scoreboard")
        if not sc_id: continue 

        if sc_id in innings_map:
            inn = innings_map[sc_id]
        else:
            continue

        if sc_id not in inning_running_score: inning_running_score[sc_id] = 0
        
        # Safe score extraction
        runs_on_ball = 0
        score_data = ball.get("score") 
        if isinstance(score_data, dict):
            runs_on_ball = int(score_data.get("runs", 0))
        elif isinstance(score_data, (int, float, str)):
             # Handle string "4" or int 4
             try: runs_on_ball = int(score_data)
             except: runs_on_ball = 0
        
        inning_running_score[sc_id] += runs_on_ball

        # Check for Wicket
        is_wicket = False
        score_name = ball.get("score_name") or ""
        
        if "wicket" in score_name.lower() or (isinstance(score_data, dict) and score_data.get("is_wicket")):
            is_wicket = True
            
            out_player_id = ball.get("batsmanout_id") or ball.get("batsman_id")
            # Fallback for FOW name
            if out_player_id in player_map:
                p_name = player_map[out_player_id].name
            else:
                p_name = "Unknown"
            
            inn.fow.append(FallOfWicket(
                player_name=p_name,
                score=inning_running_score[sc_id], 
                overs=str(ball.get("ball", "")),
                wicket_number=len(inn.fow) + 1
            ))

        # Check for Extras
        if score_name in ["Wide", "No Ball", "Bye", "Leg Bye"]:
            inn.extras += 1

        # Recent Balls
        bat_name = player_map[ball.get("batsman_id")].name if ball.get("batsman_id") in player_map else ""
        bowl_name = player_map[ball.get("bowler_id")].name if ball.get("bowler_id") in player_map else ""

        inn.recent_balls.append(BallLog(
            over=str(ball.get("ball", "")),
            batsman_name=bat_name,
            bowler_name=bowl_name,
            runs=runs_on_ball,
            is_wicket=is_wicket,
            is_four=(runs_on_ball == 4),
            is_six=(runs_on_ball == 6),
            extra_type=score_name if score_name in ["Wide", "No Ball"] else None
        ))

    # 7. Optimize Recent Balls (Keep only last 18 per inning)
    for inn in innings_map.values():
        if len(inn.recent_balls) > 18:
            inn.recent_balls = inn.recent_balls[-18:]

    # 8. Summary Scores
    for r in data.get("runs", []):
        sc_id = f"S{r['inning']}"
        if sc_id in innings_map:
            innings_map[sc_id].score = f"{r['score']}/{r['wickets']}"
            innings_map[sc_id].overs = str(r['overs'])

    return MatchDetail(
        match_id=str(data["id"]),
        status=data.get("status", "Unknown"),
        venue=data.get("venue", {}),
        toss={
            "won_by_team_id": (
                data.get("tosswon", {}).get("id")
                if isinstance(data.get("tosswon"), dict)
                else None
            ),
            "elected": data.get("elected")
        },
        scorecard=list(innings_map.values()),
        lineups={"home": home_squad, "away": away_squad}
    )