var data = {
  messages: ['','',''],
  lastMessageCounter: 0,
  actions: [],
  areas: ['Inn', 'Carpenter'],
  area: null,
  areaLabelColors: {
    Inn : 'wood'
  },
  allTimers : {
    Inn : [],
    Carpenter : []
  },
  timers : {},
  labelColors: {
    beers: 'yellow'
  },
  updateUI: true,
  playerAction: null,
  displayedStats:[],
  stats : {
    beers: 0,
    totalBeers: 0
  }
};

var elements = {
  log: document.getElementById( 'log' ),
  actions: document.getElementById( 'actions' ),
  areas: document.getElementById( 'areas' ),
  timers: document.getElementById( 'main' ),
  stats: document.getElementById( 'stats' )
};

var timers = {
  'lighting_lantern' : { area:'Inn', name:'Lighting Lantern', time: 5, color:'yellow' },
  'tapping_beer'     : { area:'Inn', name:'Tapping Beer',     time: 5, color:'yellow' , z: 1000 }
};

var handlers = {

  light_lantern : function(){
    removeAction( 'Light lantern' );
    activateTimer( timers.lighting_lantern );
  },
  lighting_lantern : function(timer){
    self.removetimer( timer );
    self.addAction( 'Tap beer', 'yellow' );
    self.addMessage( 'The lantern lights up the whole inn room' );
    self.addMessage( 'You discover a beer tap and feel thirsty.' );  
  },
  tap_beer : function(){
    activateTimer( timers.tapping_beer );
  },
  tapping_beer: function(timer){
    timer.counter = 10;
    data.stats.beers++;
    data.stats.totalBeers++;
    if( data.stats.totalBeers == 1 ){
      addMessage( 'A perfect pint, the best medicine for a head ache.' );
      addMessage( 'You drink the pint while tapping anoher one.' );
      data.displayedStats.push( 'beers' );
      data.stats.beers--;
    }
    updateUI( 'stats' );
  },
  inn: function(){
    if( data.area == 'Inn' ){
      addMessage( 'You are already in the inn, you should lay off the booze for a while.' );
    } else {
      addMessage( 'You go back to the inn.' );
      activateArea( 'Inn' );
    }
  }
  
};

var self = this;

//this <> timer objet
function genericTimerHandler(){
  this.counter--;
  if( this.counter == -1 ){
    var functionName = this.name.toFunctionName();
    if( handlers[functionName] ){
      handlers[functionName](this);
    } else {
      console.log( 'There is no handler function called ' + functionName );
    }
    if( !this.counter ){
      clearInterval(this.id);
    }
  }
  updateUI( 'timers' );
}

//Time in seconds
function activateTimer( timer){

  timer.counter = 10;
  timerID = window.setInterval( genericTimerHandler.bind(timer) , timer.time * 1000 / timer.counter);    
  timer.id = timerID;
  data.timers.push( timer );
  updateUI( "timers" );
}

function removetimer( timer ){
  data.timers.remove( timer );
  updateUI( "timers" );
}

function updateUI( element ){
  
  var i, s, action, color, area, areaLabel, timer, messageCounter, stat;
  
  if( !data.updateUI ){
    return;
  }
  //Messages
  if( element == 'messages' || element == 'all' ){
    messageCounter = data.lastMessageCounter==1?'':'('+data.lastMessageCounter+'x)';
    elements.log.innerHTML = '<td class="white">' + data.messages[2] + '<br>' +
                                             data.messages[1] + '<br>' +
                                             data.messages[0] + messageCounter + '<br>' +
                             '</td>';  
  } 
  //Actions
  if( element == 'actions' || element == 'all' ){
    s = '';

    for( i = 0; i < data.actions.length; i++ ){
      action = data.actions[i];
      color = data.labelColors[action];
      s = s + '<a href="#" class=' + color + ' id="' + action + '">' + action + '</href>';
    } 
    elements.actions.innerHTML = '<td>' + s + '</td>';  
  } 
  //Areas
  if( element == 'areas' || element == 'all' ){
    s = '';

    for( i = 0; i < data.areas.length; i++ ){
      area = data.areas[i];
      if( ( color = data.labelColors[area] ) ){
        areaLabel = area==data.area?'[' + area + ']' : area;
        s = s + '<a href="#" class="' + color + '" id="' + area + '">' + areaLabel + '</a>&nbsp;';
      } else {
        s = s + '<black>' + area + '</black>&nbsp;';
      }
    }
    elements.areas.innerHTML = '<td>' + s + '</td>';  
  }  
  //Timers
  if( element == 'timers' || element == 'all' ){
    s = '';
    for( i = 0 ; i < data.timers.length ; i++ ){
      timer = data.timers[i];
      s = s.substr(16-timer.name) + timer.name + ': ';
      s = s + '[' +  '**********'.substr(timer.counter) + '..........'.substr(10-timer.counter) + ']';
      s = '<a href="#" class="' + timer.color + ' timer" id="click_' + timer.name + '">' + s + '</a>&nbsp;<br>';
    }
    while( i++ < 6 ) s += '<br>';
    elements.timers.innerHTML = '<td>' + s + '</td>';
  }
  //Areas
  if( element == 'stats' || element == 'all' ){
    s = '';

    for( i = 0; i < data.displayedStats.length; i++ ){
      stat = data.displayedStats[i];
      color = data.labelColors[stat];
      s = s + '<span class="' + color + ' cap">' + stat + ':' + data.stats[stat] +'</span>&nbsp;';
      
    }
    elements.stats.innerHTML = '<td>' + s + '</td>';  
  }  
  wireListeners();
}

function genericClickHandler( event ){

  var element = event.target || event.srcElement;
  var handlerName = element.id.split(" ").join("_").toLowerCase();
  var handler = handlers[handlerName];
  if( handler ){
    handler();
  } else {
    console.log( 'No handler defined for ' + handlerName );  
  }
}

function wireListeners(){

  var i, anchor, anchors = document.getElementsByTagName('a');
  for( i = 0 ; i < anchors.length ; i++ ){
    anchors[i].onclick = anchors[i].onclick || genericClickHandler;   
  }
}

function addMessage( message ){
  if( message == data.messages[0] ){
    data.lastMessageCounter++;
  } else {
    data.lastMessageCounter = 1;
    data.messages.unshift( message );
  }
  updateUI( 'messages' );
}

function addAction( s , color ){
  data.actions.push( s );
  data.labelColors[s] = color;
  updateUI('actions');
}

function removeAction( s ){
  data.actions.remove( s );
  updateUI('actions');
}

function activateArea( area ){
  data.labelColors[area] = data.areaLabelColors[area]; 
  data.area = area;
  data.timers = data.allTimers[area];
  updateUI('areas');
}

addMessage( 'You awaken, your head is pounding...' );
addMessage( 'It is dark here,' );
addMessage( 'There is a lantern next to you.' );

addAction( 'Light lantern' , 'yellow' );
activateArea( 'Inn' );


//3vil detected!
Array.prototype.remove = function arrayRemove( value ) {
  this.splice( this.indexOf(value), 1);
  return this;
};

String.prototype.toFunctionName = function stringToFunctionName(){
  return this.split(" ").join("_").toLowerCase();
};
