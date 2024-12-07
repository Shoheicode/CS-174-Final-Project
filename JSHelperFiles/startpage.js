import { formatTime } from "../main";

const updateleaderboard = (bestTimes) => {
    let s = ""
	bestTimes.forEach((value, index)=>{
		s += "<div class='leaderboard-entry'>";
		if(index+1 == 1){
			s += `<span class='rank'>${index+1}st</span>`
		}
		else if(index +1 == 2){
			s += `<span class='rank'>${index+1}nd</span>`
		}
		else{
			s += `<span class='rank'>${index+1}rd</span>`
		}
		s += "<span>" + value["name"] + "</span>"
		s += "<span>" + formatTime(value["time"]) + "</span>"
		s += "</div>"
	})

	document.getElementById("leaderboard").innerHTML += "<div class='leaderboard-title'>Leaderboard</div> " +s + "</div>";
}

export {updateleaderboard}