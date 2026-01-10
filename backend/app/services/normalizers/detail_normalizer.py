from app.domain.models.match_detail import (
    MatchDetail, InningScorecard, BatsmanStats, BowlerStats, PlayerInfo
)

def normalize_match_detail(raw: dict) -> MatchDetail:
    data = raw.get("data", raw)
    #Build Team lookup map
    teams_map = {} 
    if data.get("localteam"):
        lt = data.get("localteam")
        teams_map[lt.get("id")] = lt.get("name")
        
    if data.get("visitorteam"):
        vt = data.get("visitorteam")
        teams_map[vt.get("id")] = vt.get("name")
    #Build Player Lookup Map
    player_map = {}
    home_id = data.get("localteam_id")
    away_id = data.get("visitorteam_id")
    
    home_squad = []
    away_squad = []

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
        
        #Sort into squads
        if p.get("lineup", {}).get("team_id") == home_id:
            home_squad.append(p_info)
        else:
            away_squad.append(p_info)

    #Process Innings (Group S1, S2...)
    innings_map = {} # {'S1': InningScorecard, 'S2': ...}

    #Helper to get/create inning
    def get_inning(scoreboard_id, team_id):
        if scoreboard_id not in innings_map:
            t_name = teams_map.get(team_id, "Unknown Team")

            innings_map[scoreboard_id] = InningScorecard(
                inning_number=int(scoreboard_id.replace("S", "")) if "S" in scoreboard_id else 1,
                team_id=team_id,
                team_name =t_name,
                score="0/0", 
                overs="0.0",
                batting=[], 
                bowling=[]
            )
        return innings_map[scoreboard_id]

    #Fill Batting Stats
    for b in data.get("batting", []):
        sc_id = b.get("scoreboard", "S1")
        inning = get_inning(sc_id, b.get("team_id"))
        
        #Determine status
        status = "batting" if b.get("active") else "out"
        
        inning.batting.append(BatsmanStats(
            player=player_map.get(b["player_id"], PlayerInfo(id=b["player_id"], name="Unknown", image=None, position=None)),
            runs=b.get("score", 0),
            balls=b.get("ball", 0),
            fours=b.get("four_x", 0),
            sixes=b.get("six_x", 0),
            strike_rate=b.get("rate", 0.0),
            status=status
        ))

    #Fill Bowling Stats
    for b in data.get("bowling", []):
        sc_id = b.get("scoreboard", "S1")
        '''Bowling belongs to the inning where the OPPONENT batted.
        But SportMonks links bowling to the bowling team ID.
        We attach it to the scorecard ID provided.'''
        inning = get_inning(sc_id, 0)
        
        inning.bowling.append(BowlerStats(
            player=player_map.get(b["player_id"], PlayerInfo(id=b["player_id"], name="Unknown", image=None, position=None)),
            overs=b.get("overs", 0.0),
            runs_conceded=b.get("runs", 0),
            wickets=b.get("wickets", 0),
            economy=b.get("rate", 0.0)
        ))
    
    #Fill Summary Scores (from 'runs' array)
    for r in data.get("runs", []):
        sc_id = f"S{r['inning']}"
        if sc_id in innings_map:
            innings_map[sc_id].score = f"{r['score']}/{r['wickets']}"
            innings_map[sc_id].overs = str(r['overs'])

    #Final Assemble
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