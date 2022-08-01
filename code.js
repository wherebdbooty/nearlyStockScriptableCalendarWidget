//updated the code to work with phones

//change to true if you want to show the widget in scriptable app
let _debug = false

//edit this with your calendar names
let calendars = ["Home","Family","BILLS","Just Us 💑","Philippines Holidays","US Holidays","Birthdays","Siri Suggestions"]

let months=["January","February","March","April","May","June","July","August","September","October","November","December"]
let days = "SMTWTFS"

let date = new Date()

let widget = new ListWidget()
	//CALCULATE TODAY'S DATE FROM JANUARY 1, 2001 SO THAT CALENDAR OPENS TO CURRENT MONTH WHEN WIDGET IS TAPPED
	widget.url = 'calshow:' + (Math.floor( date / 1000 ) - 978307200);
	

let startOfMonth = (new Date(date.getFullYear(), date.getMonth(), 1)).getDay()

let endOfMonth = (new Date(date.getFullYear(), date.getMonth()+1, 0)).getDate()
	endOfMonth++

//works for ipad air 4
let WW = 342
let WH = 155

if(Device.isPhone()){
  //works for iphone 6S
  WW = 322
  WH = 155
}

let body = widget.addStack()
with(body){
	backgroundColor = Color.dynamic(Color.white(), new Color("1a1a1a"))
	size = new Size(WW, WH)
	layoutHorizontally()
	setPadding(0,4,0,0)
}


let calendar = body.addStack()
	with(calendar){
		size = new Size(WW/2.5,WH*.95)
		backgroundColor = Color.clear()
		spacing = -5
		layoutVertically()
	}
	
let monthLabel = calendar.addStack()
with(monthLabel){
	size = new Size(calendar.size.width,0)
	centerAlignContent()
	setPadding(4,0,0,0)
	with(addText(months[date.getMonth()].toUpperCase())){
		textColor = Color.red()
		font = Font.boldRoundedSystemFont(11)
	}
}

let cells = calendar.addStack()
	with(cells){
		size = new Size(calendar.size.width, calendar.size.height*.85)
		layoutVertically()
	}

let counter = 0

for(let i=0; i<7; i++){
	with(cells.addStack()){
		for(let k=0; k<7; k++){
			with(addStack()){
				size = new Size(18,17)
				centerAlignContent()
				if(!i && k<7)
					with(addText(days[k])){
						if(!k || k==6)
							textColor = Color.gray()
						font = Font.boldRoundedSystemFont(12)
					}
				if(i && k==startOfMonth && !counter || counter) counter++
				if(counter && counter < endOfMonth)
					with(addText(""+counter)){
						if(!k || k==6)
							textColor = Color.dynamic(new Color("777"), Color.gray())
						if(counter==date.getDate()){
							cornerRadius = 8//22
							backgroundColor = Color.red()
							textColor = Color.white()
						}
						font = Font.boldRoundedSystemFont(10)
					}
			}
		}
	}
}

body.addSpacer(4)

with(body.addStack()){
	setPadding(body.size.height*.1,0,0,0)
	with(addStack()){
		size = new Size(1,body.size.height*.8)
		borderWidth = 1
		borderColor = Color.lightGray()
	}
}

body.addSpacer(8)

let cals =[]
for(let i=0;i<calendars.length;i++){
	cals.push(await Calendar.forEventsByTitle(calendars[i]))
}

let events = {
	today:[],
	tomorrow:[],
	week:[],		//this week
	next:[]			//next week
}
	

for(let i=0; i<cals.length; i++){
	events.today = events.today.concat(await CalendarEvent.today([cals[i]]))
	events.tomorrow = events.tomorrow.concat(await CalendarEvent.tomorrow([cals[i]]))
	events.week = events.week.concat(await CalendarEvent.thisWeek([cals[i]]))
	events.next = events.next.concat(await CalendarEvent.nextWeek([cals[i]]))
}


//REMOVE DUPLICATES AND EXPIRED EVENTS FROM TOMORROW, THISWEEK, NEXTWEEK
for(let _w in {"tomorrow":0,"week":0,"next":0} ){
	for(let i=0;i<events[_w].length; i++){
		if(events[_w][i])
			for(let _d in {"today":0,"tomorrow":0} )
				if(_d!=_w)
					for(let k=0;k<events[_d].length; k++)
						if(events[_d][k].title==events[_w][i].title)
							events[_w][i] = false

		if(events[_w][i])
			if(events[_w][i].endDate.getTime() < date.getTime())
				events[_w][i] = false
	}

	let tempArr = []

	for(let i=0;i<events[_w].length; i++)
		if(events[_w][i])
			tempArr.push(events[_w][i])

	events[_w] = tempArr
}



let eventStack = body.addStack()
with(eventStack){
	layoutVertically()
	size = new Size(WW*.5,WH*.95)
	topAlignContent()
	setPadding(4,0,0,0)
	
	for(let i in events){
		if(events[i].length){
			
			with(addText((i=="week"?"THIS ":"")+i.toUpperCase()+(i=="next"?" WEEK":""))){
				font = Font.mediumRoundedSystemFont(12)
				minimumScaleFactor = 0.2
			}
			
			for(let k=0; k<events[i].length; k++){
				with(addStack()){
					
					if(events[i][k].calendar.title=="Birthdays"){
						with(addText(" "))
							font = Font.systemFont(9)
						with(addImage(Image.fromData(Data.fromBase64String(
							"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"))))
							imageSize = new Size(12,12)
						addSpacer(2)
					}
					else{
						with(addText(" ⮑ ")){
							textColor = Color.dynamic(new Color(darkenHex(events[i][k].calendar.color.hex,.67)), new Color(events[i][k].calendar.color.hex))
							font = Font.heavySystemFont(9)
						}
					}
						//with(addText("🎁 "))
							//font = Font.systemFont(9)
					with(addText(events[i][k].title)){
						lineLimit = 1
						textColor = Color.dynamic(new Color(darkenHex(events[i][k].calendar.color.hex,.67)), new Color(events[i][k].calendar.color.hex))
						font = Font.boldSystemFont(12)
						minimumScaleFactor = 0.2
					}
				}
			}

			eventStack.addSpacer(8-(events.today.length+events.tomorrow.length+events.week.length+events.next.length)*.75)
		}
	}
}
if(_debug)	widget.presentMedium()
else{
	Script.setWidget(widget)
	App.close()
}
Script.complete()

function darkenHex(_color, _amount){
	let _h = "0123456789ABCDEF"
	let _temp = ""
	
	_temp = _color.split("")
	
	for(let i=0; i<_temp.length; i++)
		_temp[i]=_h[Math.ceil(_h.indexOf(_temp[i])*_amount)]
	
	return _temp.join("")
}
	
