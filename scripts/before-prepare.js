const PLUGIN_NAME         = "cordova-android-fixing-libs-versions-gradle-release";

try{
    var fs = require('fs');
    var path = require('path');
    var parser = require('xml2js');
}catch(e){
    throw PLUGIN_NAME + ": Failed to load dependencies. If using cordova@6 CLI, ensure this plugin is installed with the --fetch option: " + e.message;
}

const GRADLE_FILENAME     = path.resolve(process.cwd(), 'platforms', 'android', PLUGIN_NAME, 'properties.gradle');
const PROPERTIES_TEMPLATE = 'ext {PLAY_SERVICES_VERSION = "<PLAY_SERVICES_VERSION>"; ANDROID_SUPPORT_VERSION = "<ANDROID_SUPPORT_VERSION>"; }';

// 1. Parse cordova.xml file and fetch this plugin's <variable name="PLAY_SERVICES_VERSION" />
fs.readFile(path.resolve(process.cwd(), 'config.xml'), function(err, data) {
  var json = parser.parseString(data, function(err, result) {
    if (err) {
      return console.log(PLUGIN_NAME, " ERROR: ", err);
    }
    var plugins = result.widget.plugin;
    if(!plugins || plugins.length === 0) return;
    for (var n=0,len=plugins.length;n<len;n++) {
      var plugin = plugins[n];
      if (plugin.$.name === PLUGIN_NAME) {
        if (!plugin.variable || plugin.variable.length < 2) {
          return console.log(PLUGIN_NAME, ' Failed to find <variable name="PLAY_SERVICES_VERSION" /> and <variable name="ANDROID_SUPPORT_VERSION" /> in config.xml');
        }
        // 2.  Update .gradle file.
        setGradleVersion(plugin.variable);
        break;
      }
    }
  });
});

/**
* Write properties.gradle with:
*
ext {
  PLAY_SERVICES_VERSION = '<VERSION>';
  ANDROID_SUPPORT_VERSION = '<VERSION>';
}
*
*/
function setGradleVersion(variables) {
  console.info(PLUGIN_NAME, "TEST : "+JSON.stringify(variables));
  var propertiesContent = PROPERTIES_TEMPLATE;
  for(var i=0; i<variables.length; i++) {
    var variableName = variables[i].$.name;
    var variableValue = variables[i].$.value;

    console.log(PLUGIN_NAME, " "+variableName+": ", variableValue);
    propertiesContent = propertiesContent.replace("<"+variableName+">", variableValue);
  }
  fs.writeFile(GRADLE_FILENAME, propertiesContent, 'utf8', function (err) {
    if (err) return console.log(PLUGIN_NAME, " FAILED TO WRITE ", GRADLE_FILENAME, " > ", JSON.stringify(variables), err);
  });
}





