const DEBUG = false;
//const blur = 75;
const blurModule = importModule('blurred.js');

const width = 135
const height = 5

const WIDGET_SIZE = new Size(338,158)
// Font & fontSize
const HELVETICA_NEUE_FONT = 'HelveticaNeue-Regular';
const HELVETICA_NEUE_BOLD_FONT = 'HelveticaNeue-Bold';
const HELVETICA_NEUE_LIGHT_FONT = 'HelveticaNeue-Light';

const smallFontSize = 10
const thinFontSize = 11
const defaulFontSize = 11
const boldFontSize = 13

const fonts = {
  small: new Font(HELVETICA_NEUE_FONT, smallFontSize),
  thin: new Font(HELVETICA_NEUE_LIGHT_FONT, thinFontSize),
  default: new Font(HELVETICA_NEUE_FONT, defaulFontSize),
  bold: new Font(HELVETICA_NEUE_BOLD_FONT, boldFontSize)
}

// const useSmallFont = new Font(HELVETICA_NEUE_FONT, smallFontSize);
// const useThinFont = new Font(HELVETICA_NEUE_LIGHT_FONT, fontSize);
// const useFont = new Font(HELVETICA_NEUE_FONT, fontSize);
// const useBoldFont = new Font(HELVETICA_NEUE_BOLD_FONT, boldFontSize);

// colors
const colors = {
whiteColor: new Color('#ffffff'),
greenColor: new Color('#1DB954'),
greyColor: new Color('#bcbccb')
}

// get storage
let fm = FileManager.iCloud() || FileManager.local()
const docs = fm.documentsDirectory();
const dir = getDirectory()

let prevPath = fm.joinPath(dir, "spotify-last-played.json");
let credsPath = fm.joinPath(dir, "spotify-credentials.json")
let progressPath = fm.joinPath(dir, "spotify-progress-played-track.json")
let bgPath = fm.joinPath(dir, "mediumBottom.jpg");

// icons
let spotifyIcon = await getImage("spotify-icon.png")
  let sloganIcon = await getImage("spotify-logo-green.png")
  let pauseIcon = await getImage("pause-icon.png")
  let playIcon = await getImage("play-icon.png")
  let squareIcon = await getImage("square-icon.png")
  let forwardIcon = await getImage("forward-icon.png")
  let backwardIcon = await getImage("backward-icon.png")
  let heartIcon = await getImage("heart-icon.png")

/**************** content ***********+++*/

let spotifyCreds

let widget = await createWidget()
if (!config.runsInWidget) {
  widget.presentMedium();
}
Script.setWidget(widget);
Script.complete();

async function createWidget() {
    let w = new ListWidget();
    let date = new Date();
    w.setPadding(20, 10, 5, 8);
    w.size = new Size(338, 158);
    w.spacing = 3
    
    let nowPlaying;
    spotifyCreds = await loadSpotifyCredentials()
    if (spotifyCreds != null) {
      nowPlaying = await loadNowPlaying();
    }
    
    debug(`nowPlaying: ${JSON.stringify(nowPlaying)}`);
    
    let songTitle, songArtist, coverUrl, trackProgress, trackLength;
            if(nowPlaying != null && nowPlaying.is_playing) {
              isPlaying = true
              
      songTitle = nowPlaying.item.name
      //split(" (")[0];
      songArtist = nowPlaying.item.artists[0].name;
      coverUrl = nowPlaying.item.album.images[0].url
      trackProgress = nowPlaying.progress_ms;
      trackLength = nowPlaying.item.duration_ms;
        
    let prevSongPlayed = {
        title: songTitle,
        artist: songArtist,
        img: coverUrl,
        progress_ms: trackProgress,
        duration_ms: trackLength
    };
                   
    fm.writeString(prevPath, JSON.stringify(prevSongPlayed)); 
    debug(`is Playing: ${isPlaying}`)

    let coverImage = await loadImage(coverUrl);
    
  // blurImage bg function
  let blurredCoverImage = await blurModule.blurImage(coverImage, "dark",75);
  w.backgroundImage = blurredCoverImage;

  let row = w.addStack();
  //row.size = new Size(310, 158);
  row.size = new Size(320,145);
        
  let cover = row.addImage(coverImage)
  cover.cornerRadius = 6
  cover.shadowColor = new Color('#bcbccb', 0.5)
  cover.shadowRadius = 1
  cover.shadowOffset = 0,1
  cover.borderColor = new Color("#bcbccb", 0.5)
  cover.borderWidth = 3
  cover.imageSize = new Size(130,130)
  
  row.addSpacer(10)
  
  let stack = row.addStack()
  stack.layoutHorizontally()
  stack.size = new Size(169,145)
//stack.size = new Size(170,150)
  
 let stack1 = stack.addStack()
stack1.size = new Size(0,0)
  stack1.layoutVertically()
  
  let spotifyIconImage = stack1.addImage(spotifyIcon)
  spotifyIconImage.centerAlignImage()
  
  stack1.addSpacer(2)
  
  // add title and artist
  let titleTxt = stack1.addText(songTitle)
  titleTxt.font = fonts.bold
  titleTxt.textColor = new Color("#1DB954")
  titleTxt.minimumScaleFactor = 0.9
  titleTxt.lineLimit = 2
  
  stack1.addSpacer(2)

  let artistTxt = stack1.addText(songArtist)
  artistTxt.font = fonts.default
  artistTxt.textColor = new Color("#fff", 0.8)
  artistTxt.lineLimit = 1
  
  stack1.addSpacer(15)
  
  //add player icons
  let playerStack = stack1.addStack()
  playerStack.layoutHorizontally()
  playerStack.centerAlignContent()
  
  playerStack.addSpacer(0)
  
  let backwardIconImage = playerStack.addImage(backwardIcon)
  backwardIconImage.tintColor = colors.whiteColor
  backwardIconImage.url = "http://open.spotify.com/";
   
  playerStack.addSpacer()
  
  let pauseIconImage = playerStack.addImage(pauseIcon)
  pauseIconImage.leftAlignImage()
  pauseIconImage.tintColor = colors.whiteColor
  pauseIconImage.url = "http://open.spotify.com/";
  
  playerStack.addSpacer()
  
  let forwardIconImage = playerStack.addImage(forwardIcon)
  forwardIconImage.tintColor = colors.whiteColor
  forwardIconImage.url = "http://open.spotify.com/";

  stack1.addSpacer(0)
  stack.addSpacer()
  
  const trackLengthInSeconds = Math.floor(trackLength / 1000);
  const trackProgressInSeconds = Math.floor(trackProgress / 1000);

  const progressMinutes = Math.floor(trackProgressInSeconds / 60);
  const progressSeconds = trackProgressInSeconds % 60;
  const durationMinutes = Math.floor(trackLengthInSeconds / 60);
  const durationSeconds = trackLengthInSeconds % 60;

  const progressTimeString = `${progressMinutes.toString().padStart(2, '0')}:${progressSeconds.toString().padStart(2, '0')}`;
  const durationTimeString = `${durationMinutes.toString().padStart(2, '0')}:${durationSeconds.toString().padStart(2, '0')}`;

  const progress = trackProgressInSeconds; // Progress in seconds
  const totalDuration = trackLengthInSeconds; // Total duration in seconds
  const totalTrackLenght = totalDuration; // Total length of the track

  stack1.addSpacer(5)
  
  const progressBar = stack1.addImage(provideProgressBar(progress, totalDuration, totalTrackLenght));
  progressBar.size = new Size(width, height)
  progressBar.centerAlignImage()
  
  const timeTextStack = stack1.addStack();
  timeTextStack.layoutHorizontally();
        
  const progressTimeText = timeTextStack.addText(`${progressTimeString}`);
  progressTimeText.font = fonts.small;
  progressTimeText.textColor = new Color('#fff', 0.7);
        
  timeTextStack.addSpacer();
        
  const remainingTimeText = timeTextStack.addText(`${durationTimeString}`);
  remainingTimeText.font = fonts.small;
  remainingTimeText.textColor = new Color('#fff', 0.7);
  
  stack1.addSpacer(10)  
    
  } else {
  
//// Spotify playback stopped
let isPlaying = false
if (!fm.fileExists(prevPath) && nowPlaying === null && nowPlaying.is_Playing === null) { 

  let prev = JSON.parse(prevPath);
        
  songTitle = prev.title;
  songArtist = prev.artist;
  coverUrl = prev.img;
  trackProgress = prev.progress_ms;
  trackLength = prev.duration_ms;
};         
        
  let bgImg = fm.readImage(bgPath);
  let blurredCoverImage = await blurModule.blurImage(bgImg, "dark",50);
  w.backgroundImage = blurredCoverImage;
  
  let row = w.addStack();
  row.size = new Size(315, 145);
    
  let cover = row.addImage(squareIcon)
  cover.tintColor = Color.clear()
  cover.cornerRadius = 6
  cover.borderColor = new Color("#bcbccb", 0.3)
  cover.borderWidth = 3
  cover.imageSize = new Size(130,130)
  
  row.addSpacer(10)
  
  let stack = row.addStack()
  stack.layoutHorizontally()
  stack.size = new Size(169,145)
//stack.size = new Size(170,150)
  
  let stack1 = stack.addStack()
stack1.size = new Size(0,0)
  stack1.layoutVertically()
  
  let spotifyIconImage = stack1.addImage(spotifyIcon)
  spotifyIconImage.centerAlignImage()
  
  stack1.addSpacer(2)
  
// add title and artist
  let titleTxt = stack1.addText("SPOTIFY PLAYER")
  titleTxt.font = fonts.bold
  titleTxt.textColor = new Color("#1DB954", 1)
  titleTxt.lineLimit = 1
  
  stack1.addSpacer(2)

  let artistTxt = stack1.addText("CLICK TO PLAY SPOTIFY")
  artistTxt.font = fonts.default
  artistTxt.textColor = new Color("#fff", 0.8)
  artistTxt.lineLimit = 1

  stack1.addSpacer(15)
  
//add player icons
  let playerStack = stack1.addStack()
  playerStack.layoutHorizontally()
  playerStack.centerAlignContent()
  
  playerStack.addSpacer(0)
  
  let backwardIconImage = playerStack.addImage(backwardIcon)
  backwardIconImage.centerAlignImage()
  backwardIconImage.tintColor = colors.whiteColor
  backwardIconImage.url = "http://open.spotify.com/";
   
  playerStack.addSpacer()
  
  let playIconImage = playerStack.addImage(playIcon)
  playIconImage.centerAlignImage()
  playIconImage.tintColor = colors.whiteColor
  playIconImage.url = "http://open.spotify.com/";
  
  playerStack.addSpacer()
  
  let forwardIconImage = playerStack.addImage(forwardIcon)
  forwardIconImage.centerAlignImage()
  forwardIconImage.tintColor = colors.whiteColor
  forwardIconImage.url = "http://open.spotify.com/";
  
 stack1.addSpacer(0)      
    
  let prev = JSON.parse(fm.readString(prevPath));
   // debug(prev)
    debug(`is Playing: ${isPlaying}`)

  const trackProgress = prev.progress_ms;
  const trackLength = prev.duration_ms;
    
   const trackLengthInSeconds = Math.floor(trackLength / 1000);
   const trackProgressInSeconds = Math.floor(trackProgress / 1000);
    
  const progressMinutes = Math.floor(trackProgressInSeconds / 60);
  const progressSeconds = trackProgressInSeconds % 60;
  const durationMinutes = Math.floor(trackLengthInSeconds / 60);
  const durationSeconds = trackLengthInSeconds % 60;

  const progressTimeString = `${progressMinutes.toString().padStart(2, '0')}:${progressSeconds.toString().padStart(2, '0')}`;
  const durationTimeString = `${durationMinutes.toString().padStart(2, '0')}:${durationSeconds.toString().padStart(2, '0')}`;

  const progress = trackProgressInSeconds; // Progress in seconds
  const totalDuration = trackLengthInSeconds; // Total duration in seconds
  const totalTrackLenght = totalDuration; // Total length of the track
  
  stack1.addSpacer(5)
  
  const progressBar = stack1.addImage(provideProgressBar(progress, totalDuration, totalTrackLenght));
   progressBar.size = new Size(width, height)
  progressBar.centerAlignImage()
  
  stack1.addSpacer(3)
  
  const timeTextStack = stack1.addStack();
  timeTextStack.layoutHorizontally();  
  
  const progressTimeText = timeTextStack.addText(`${progressTimeString}`);
  progressTimeText.font = fonts.small;
  progressTimeText.textColor = new Color('#fff', 0.7);
        
  timeTextStack.addSpacer();
        
  const remainingTimeText = timeTextStack.addText(`${durationTimeString}`);
  remainingTimeText.font = fonts.small;
  remainingTimeText.textColor = new Color('#fff', 0.7);
  
  stack1.addSpacer(10)
    }
    return w;
  
  }


function provideProgressBar(progress, totalDuration, trackLength) {
  const progressBarWidth = 200;
  const progressBarHeight = 10;
  
  const draw = new DrawContext();
  draw.opaque = false;
  draw.respectScreenScale = true;
  draw.size = new Size(progressBarWidth, progressBarHeight);

  const barPath = new Path();
  const barHeight = progressBarHeight - 5;
  barPath.addRoundedRect(new Rect(0, 2.5, progressBarWidth, barHeight), barHeight / 2, barHeight / 2);
  draw.addPath(barPath);
  
  draw.setFillColor(new Color("#fff", 0.3));
  draw.fillPath();

  const currentProgress = progress / totalDuration;
  const ballPositionX = progressBarWidth * currentProgress;

  const currPath = new Path();
  currPath.addEllipse(new Rect(ballPositionX, 0, progressBarHeight, progressBarHeight));
  draw.addPath(currPath);
  draw.setFillColor(new Color("#fff", 1));
  draw.fillPath();

  // Draw text indicating current progress time
  const currentProgressTime = calculateCurrentProgress(progress, trackLength);
  const textRect = new Rect(0, progressBarHeight, progressBarWidth, progressBarHeight);
  draw.setTextColor(new Color("#fff", 0.5));
  draw.setFont(fonts.small);
  draw.drawTextInRect(currentProgressTime, textRect);

  return draw.getImage();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function calculateCurrentProgress(progress, totalDuration) {
  const ratio = progress / totalDuration;
  const currentProgressInSeconds = ratio * totalDuration;
  return formatTime(Math.round(currentProgressInSeconds));
}


// Format duration in milliseconds to HH:MM format
function formatDuration(durationInMs) {
    const totalSeconds = Math.floor(durationInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}


async function loadSpotifyCredentials() {
    let newCreds;
    if (fm.fileExists(credsPath)) {
        await fm.downloadFileFromiCloud(credsPath);
        let data = fm.readString(credsPath)
        newCreds = JSON.parse(data);
        debug(JSON.stringify(newCreds));
        
        if (isNotEmpty(newCreds.clientId) &&
            isNotEmpty(newCreds.clientSecret) &&
            isNotEmpty(newCreds.refreshToken)) {
//            isNotEmpty(newCreds.accessToken)) {

            return newCreds;
        }

    } else {
        let clientId, clientSecret, refreshToken;  
        
        let cidAlert = new Alert();
        cidAlert.title = "Client ID";
        cidAlert.message = "Client ID from spotify";  
        cidAlert.addTextField("Client ID");
        cidAlert.addAction("Continue");
        cidAlert.addCancelAction("Cancel");
        
        let csAlert = new Alert();
        csAlert.title = "Client Secret";
        csAlert.message = "Client Secret from spotify";  
        csAlert.addTextField("Client Secret");
        csAlert.addAction("Continue");
        csAlert.addCancelAction("Cancel");
        
        let rtAlert = new Alert();
        rtAlert.title = "Refresh Token";
        rtAlert.message = "Refresh Token from spotify";  
        rtAlert.addTextField("Refresh Token");
        rtAlert.addAction("Continue");
        rtAlert.addCancelAction("Cancel");
        
        let cidRes = await cidAlert.present();
        if (cidRes != -1) {
            clientId = cidAlert.textFieldValue(0);
            
        let csRes = await csAlert.present();
  if (csRes != -1) {
    clientSecret = csAlert.textFieldValue(0);
    
    let rtRes = await rtAlert.present();
    if (rtRes != -1) {
refreshToken = rtAlert.textFieldValue(0);
                    
        newCreds = {
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        };
      }
    }
  }
  
  if (!clientId || !clientSecret || !refreshToken)
            return null;
            return newCreds;
    }
}

async function loadNowPlaying(calls=0) {
    // base case for recursive call to avoid StackOverflow.
    if (calls > 5) { // just to be sure :)
        debug('calls > 5');
        return null;
    }
    debug('building request');
    let req = new Request("https://api.spotify.com/v1/me/player");
    req.headers = {
        "Authorization": "Bearer " + spotifyCreds.accessToken,
        "Content-Type": "application/json"
    };

    debug('about to make request');
    let res = await req.load();
    debug(`statusCode: ${req.response.statusCode}`);
    if (req.response.statusCode == 401) {
        // Access Denied -- Refresh Access Token and try again.
        if (refreshAccessToken()) {
            return await loadNowPlaying(calls + 1);
        } else {
            return null;
        }
    } else if (req.response.statusCode == 204) {
      // nothing is playing
//debug(JSON.parse(res.toRawString()));
        return null;
        
    } else if (req.response.statusCode == 200) {
        return JSON.parse(res.toRawString());
    }

    return res;
}

async function refreshAccessToken() {
    debug('refreshAccessToken()');
    if (spotifyCreds != null) {
        // Create the request.
        let req = new Request("https://accounts.spotify.com/api/token");
        req.method = "POST";
        req.headers = { "Content-Type": "application/x-www-form-urlencoded" };
        req.body = "grant_type=refresh_token&refresh_token=" + spotifyCreds.refreshToken + "&client_id=" + spotifyCreds.clientId + "&client_secret=" + spotifyCreds.clientSecret;

        // Send request and await result.
        debug('Making request');
        let res;  
        await req.loadJSON().then((rs) => {
            res = rs;

            debug(`rs: ${JSON.stringify(rs)}`);
        }).catch((err) => {
            debug('stinky error: ' + err);
        });

        debug(`accessToken: ${res.access_token}`);
        spotifyCreds.accessToken = res.access_token;
  

        // Save the credentials to a file for later use.
        let fm = FileManager.iCloud() || FileManager.local();
        if (spotifyCreds != null)
            fm.write(credsPath, Data.fromString(JSON.stringify(spotifyCreds)));
        else {
            let alert = new Alert();
            alert.title = "Error";
            alert.message = "One ore more credentials were missing.";
            alert.addCancelAction("Done");
            alert.present();
        }

        debug('refresh successful');
        return true; // Return true if successful.
    }

    debug('refresh unsuccessful!');
    return false; // Otherwise return false. :(
}

function debug(...msg) {
    if (DEBUG) {
        console.log(...msg);
    }
}

function isNotEmpty(s) {
    return s != null && s.length > 0;
}

function getDirectory() {
  const dir = fm.joinPath(docs, "/spotify");
  if (!fm.fileExists(dir)) {
    fm.createDirectory(dir);
  }

  return dir;
}

async function getImage(image) {
  let imgPath = fm.joinPath(dir, image)
  if(fm.fileExists(imgPath)){
    fm.downloadFileFromiCloud(imgPath)
    image = fm.readImage(imgPath)
  } else {
  // download once
    let imageUrl
    switch (image) {
      case 'spotify-icon.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/spotify-icon.png"
      break;
      case 'shuffle-icon.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/shuffle-icon.png"
      break;
      case 'repeat-icon.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/repeat-icon.png"
      break;
      case 'pause-icon.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/pause-icon.png"
      break;
      case 'play-icon.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/play-icon.png"
      break;
      case 'square-icon.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/square-icon.png"
      break;
      case 'forward-icon.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/forward-icon.png"
      break;
      case 'backward-icon.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/backward-icon.png"
      break;
      case 'heart-icon.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/heart-icon.png"
      break;
      case 'spotify-logo-green.png':
      imageUrl = "https://raw.githubusercontent.com/xoDeinemudda/Scriptable/main/Widgets/Sootify/spotify-logo-green.png"
      default:
      debug(`Sorry, couldn't find ${image}.`);
    }
    
    let image = await new Request(imageUrl).loadImage()
    fm.writeImage(path, image)
    }
    return image
}


async function loadImage(imgUrl) {
    let req = new Request(imgUrl);
    return await req.loadImage();
}


