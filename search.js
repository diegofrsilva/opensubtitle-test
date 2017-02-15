var FILE_NAME = 'The Warriors [Ultimate Director\'s Cut].1979.BRRip.XviD-VLiS.avi';
var SUBTITLE_FILE_NAME = 'The Warriors [Ultimate Director\'s Cut].1979.BRRip.XviD-VLiS';

const fs = require('fs');
const readline = require('readline');

const zlib = require('zlib');
const request = require('request');

const OS = require('opensubtitles-api');
const OpenSubtitles = new OS({
    useragent:'OSTestUserAgentTemp'
});

var app = new SubtitleHandler();
app.search(FILE_NAME, subtitles => {
	app.printSubtitles(subtitles);
	app.readSelectedLanguageId(subtitles, selectedLangId => {
		if(!subtitles[selectedLangId]) {
			console.log('Invalid language id!');
			return;
		}
		app.downloadSubtitle(SUBTITLE_FILE_NAME, subtitles[selectedLangId], () => {
			console.log('Your subtitle was successfully saved!');
		});
	});
});

function SubtitleHandler() {

	this.search = function(filename, callback) {
		console.log('Searching subtitles for ' + filename);

		OpenSubtitles.search({
			filename: filename,
			gzip: true
		}).then(callback);
	},
	this.printSubtitles = function(subtitles) {
		console.log('Found subtitles: ');

		for(var langId in subtitles) {
			var subtitle = subtitles[langId];
			console.log(langId + ' - ' + subtitle.langName);
		}
	},
	this.readSelectedLanguageId = function(subtitles, callback) {
		console.log('Select the subtitle by typping the language id: ');

		var reader = readline.createInterface({
			input: process.stdin,
	  		output: process.stdout,
	  		terminal: false
		});
		
		reader.on('line', function(selectedLangId) {
			callback(selectedLangId);
			reader.close();
		});
	}
	this.downloadSubtitle = function(subtitleFileName, selectedSubtitle, callback) {
		console.log('Downloading the selected subtitle... ');

		request({
			url: selectedSubtitle.url,
			encoding: null
		}, (error, response, data) => {
			if (error) throw error;

			zlib.unzip(data, (error, buffer) => {
				if (error) throw error;
				
				fs.writeFile(subtitleFileName + ".srt", buffer,  "binary", function(err) {
					if(err) {
						console.log(err);
					} else {
						callback();
					}
				});
			});
		});

	}
}
