var spiritsClues = {
	'BAN' : ['EPR', 'TMP', 'EMF'],
	'CAU' : ['SPB', 'TMP', 'OFA'],
	'DEM' : ['SPB', 'ECR', 'TMP'],
	'ESP' : ['SPB', 'EPR', 'ECR'],
	'FAN' : ['TMP', 'EMF', 'OFA'],
	'JIN' : ['SPB', 'EMF', 'OFA'],
	'OMB' : ['ECR', 'EMF', 'OFA'],
	'ONI' : ['SPB', 'ECR', 'EMF'],
	'PLT' : ['SPB', 'EPR', 'OFA'],
	'REV' : ['EPR', 'ECR', 'EMF'],
	'SPE' : ['SPB', 'EPR', 'TMP'],
	'YUR' : ['ECR', 'TMP', 'OFA']
};

var active_clues = [];		// Clues checked
var impossible_clues = [];  // Clues unchecked
var start_timer;			// Timer start timestamp
var availableTime;			// Available time regarding difficulty
var timerRefresh;			// interval function
var language;				// Language JSON

/**
 * Init
 **/
$(function(){
	reset();

	$(".clue").on('click', function(){
		toggleClue($(this).attr('id'));
	});

	$("#spiritList div").on('click', function(){
		$(".info").hide();
		$("#INF"+$(this).attr('id')).show();
	});	

	$(".difBtn").on('click', function(){
		start_timer = Date.now();
		var d = $(this).attr('id');
		availableTime = 60;
		switch(d){
			case 'AMA':
				availableTime *= 5;
				break;
			case 'INT':
				availableTime *= 2;
				break;
			default:
				availableTime *= 0;
				break;
		}
		refreshTimer();
		$("#timer").show();
		$(".difBtn").hide();
		timerRefresh = setInterval(refreshTimer, 1000);
	});

	$("#RESET").on('click', function(){
		reset();
	});

	$(".lang").on('click', function(){
		loadLang($(this).attr("id"));
	});
	generateDom();
});

/**
 * Reset application
 */
function reset()
{
	$("#noSolutions, .info").hide();
	$("#timer").hide();
	//$("#reset").hide();
	$(".difBtn").show();
	$(".clue").removeClass('red').removeClass('green').addClass('grey');
	$(".ink-button.clue span.yn").html("&nbsp;");
	active_clues = [];
	impossible_clues = [];	
	refreshSpirits();
	start_timer = null;
}

/**
 * Update timer (interval function)
 */
function refreshTimer()
{
	var n = Date.now();
	var t = availableTime - ((n - start_timer)/(1000));
	if(t < 0){ 
		t=0;
		clearInterval(timerRefresh);
	}
	var m = Math.floor(t / 60);
	var s = Math.floor(t % 60);
	if(m < 10){ m = '0'+m;}
	if(s < 10){ s = '0'+s;}
	$("#timer").html(m+':'+s);
}

/**
 * Toggle clues buttons between "yes" / "no" / "undetermined"
 */
function toggleClue(id)
{
	if($("#"+id).hasClass('grey')){
		$("#"+id).removeClass('grey').addClass('green');
		$("#"+id+" span.yn").html(language.OUI);
		active_clues.push(id);
	}else if($("#"+id).hasClass('green')){
		$("#"+id).removeClass('green').addClass('red');
		$("#"+id+" span.yn").html(language.NON);
		active_clues.splice(active_clues.indexOf(id), 1);
		impossible_clues.push(id);
	}else{
		$("#"+id).removeClass('red').addClass('grey');
		$("#"+id+" span.yn").html("&nbsp;");
		impossible_clues.splice(active_clues.indexOf(id), 1);
	}
	console.debug(active_clues);
	refreshSpirits();
}

/**
 * Calculate likely spirit list 
 */
function refreshSpirits()
{
	var potentialsSpirits = [];
	var inpossibleSpirits = [];

	for(k in spiritsClues){
		potentialsSpirits.push(k)
	}

	for(k in active_clues)
	{
		inpossibleSpirits = [];
		for(l in potentialsSpirits){
			if(-1 == $.inArray(active_clues[k], spiritsClues[potentialsSpirits[l]])){
				inpossibleSpirits.push(potentialsSpirits[l]);
			}
		}
		potentialsSpirits = $.grep(potentialsSpirits, function(val) {
		    return $.inArray(val, inpossibleSpirits) < 0;
		});
	}

	var potentialsSpiritsSave = potentialsSpirits;

	for(k in impossible_clues){
		inpossibleSpirits = [];
		for(l in potentialsSpirits){
			if(-1 != $.inArray(impossible_clues[k], spiritsClues[potentialsSpirits[l]])){
				inpossibleSpirits.push(potentialsSpirits[l]);
			}
		}
		potentialsSpirits = $.grep(potentialsSpirits, function(val) {
		    return $.inArray(val, inpossibleSpirits) < 0;
		});
	}

	console.debug(potentialsSpirits);
	updateDisplay(potentialsSpirits); // @todo Last call remaining ?
}

/**
 * Update display of spirits / available combinate "clues"
 */
function updateDisplay(potentialsSpirits)
{
	$("#noSolutions, .info").hide();
	$("#spiritList div").hide();
	$(".sclues li").removeClass("checkedClue");

	if(potentialsSpirits.length == 0){
		$("#noSolutions").show();
		return;
	}

	$(".clue").attr('disabled', true);

	var potentialsClue = [];

	for(k in potentialsSpirits){
		$("#"+potentialsSpirits[k]).show();

		for(l in spiritsClues[potentialsSpirits[k]]){
			if(-1 == $.inArray(spiritsClues[potentialsSpirits[k]][l], active_clues)){
				potentialsClue.push(spiritsClues[potentialsSpirits[k]][l]);
			}
		}
	}

	for(k in potentialsClue){
		$("#"+potentialsClue[k]).removeAttr('disabled');
	}
	for(k in active_clues){
		$("#"+active_clues[k]).removeAttr('disabled');
		$(".sclues li."+active_clues[k]).addClass("checkedClue");
	}
	$(".clue.red").removeAttr('disabled');

	if(potentialsSpirits.length == 1){
		$("#INF"+potentialsSpirits[0]).show();
		$("#spiritList div").hide();
		return;
	}
	
	console.debug(potentialsClue);

}

/**
 * Generate DOM content regarding Spirit => Clues configuration
 */
function generateDom()
{
	// Spirits and attached clues
	for(key in spiritsClues){
		$("#spiritList").append(
			'<div class="all-20 small-50 tiny-100" id="'+key+'">'
				+'<span class="'+key+'"></span><br />'
				+'<ul class="sclues">'
					+'<li class="'+spiritsClues[key][0]+'"></li>'
					+'<li class="'+spiritsClues[key][1]+'"></li>'
					+'<li class="'+spiritsClues[key][2]+'"></li>'
				+'</ul>'
			+'</div>'
		);	    
	}
	loadLang('fr_FR');
}

/**
 * Switch language
 */
function loadLang(lang)
{
	$.getJSON('i18n/'+lang+".json", null, function(dataJson){
		for(id in dataJson){
			if(id[0] == "#" || id[0] == "."){
				$(id).html(dataJson[id]);
			}
		}

		language = dataJson;
		$(".ink-button.clue.red span.yn").html(language.NON);
		$(".ink-button.clue.green span.yn").html(language.OUI);
	})
	.fail(function(obj, textStatus, errorThrown){
		console.log(textStatus);
	});
}