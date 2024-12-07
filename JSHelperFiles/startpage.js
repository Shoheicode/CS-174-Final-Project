import { formatTime } from "../main";

// Updates the leaderboard
const updateleaderboard = (bestTimes) => {
	// Updates the s string
    let s = ""

	// Goes through the best times and update the string
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

	// updates the leaderboard inner.html with that data.
	document.getElementById("leaderboard").innerHTML += "<div class='leaderboard-title'>Leaderboard</div> " +s + "</div>";
}

// Export this leaderboard update
export {updateleaderboard}