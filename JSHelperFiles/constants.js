let m = [
	["FCLU","FR","FR","DR","FR","FR","FR","FR","IR","C1R","FR","FR","PR","FR","DR","FR","FR","FR","FCUR","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","IF","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES"],
	["DF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FCLU","DR","PR","C2R","FR","FCRD","ES"],
	["IF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["SP","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","C3F","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","IF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["PF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FCLU","DR","FR","FCRD","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FCLU","FR","FR","FCUR","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","DF","ES","ES","FF","ES","ES","PF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["IF","ES","ES","ES","FF","ES","ES","FF","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FCDL","FR","FR","FR","FCRD","ES","ES","FCDL","IR","C4R","FCRD","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
]

let m2 = [
	["FCLU","FR","IR","FR","FCUR","ES","FCLU","FR","C1R","FR","FCUR","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","IF","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","FF","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","FF","ES","ES","ES","DF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FCDL","DR","FCRD","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","C2F","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["DF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["SP","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","IF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["PF","ES","ES","ES","ES","ES","ES","ES","ES","ES","C3F","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","FR","FR","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["IF","ES","ES","ES","ES","ES","ES","ES","ES","ES","PF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FCDL","FR","C4R","FR","FR","FR","FR","DR","FR","FR","FCRD","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
]

let m3 = [
	["FCLU","FR","FR","IR","FCUR","ES","FCLU","FR","C1R","DR","FCUR","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","FF","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","FF","ES","FF","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","PF","ES","FF","ES","ES","ES","C2F","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["DF","ES","ES","ES","FCDL","FR","FCRD","ES","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FCDL","PR","IR","FR","FR","FR","FR","FCUR","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["SP","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","DF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","PF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FCLU","FR","DR","FR","FR","FCUR","ES","FF","ES","ES"],
	["FF","ES","ES","ES","ES","ES","ES","ES","ES","ES","C3F","ES","ES","ES","ES","FF","ES","FF","ES","ES"],
	["IF","ES","ES","ES","ES","ES","ES","ES","ES","ES","FF","ES","ES","ES","ES","FF","ES","FF","ES","ES"],
	["PF","ES","ES","ES","FCLU","FR","FR","FCUR","ES","ES","PF","ES","ES","ES","ES","FF","ES","IF","ES","ES"],
	["FF","ES","ES","ES","FF","ES","ES","FF","ES","ES","FF","ES","ES","ES","ES","FCDL","FR","FCRD","ES","ES"],
	["FF","ES","ES","ES","FF","ES","ES","FF","ES","ES","FF","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
	["FCDL","FR","C4R","DR","FCRD","ES","ES","FCDL","IR","FR","FCRD","ES","ES","ES","ES","ES","ES","ES","ES","ES"],
]

export {m, m2, m3}