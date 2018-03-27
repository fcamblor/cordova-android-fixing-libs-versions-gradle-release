const PLUGIN_NAME = "cordova-android-fixing-libs-versions-gradle-release";

try{
    var fs = require('fs');
    var path = require('path');
    var parser = require('xml2js');
}catch(e){
    throw PLUGIN_NAME + ": Failed to load dependencies. If using cordova@6 CLI, ensure this plugin is installed with the --fetch option: " + e.message;
}

const GRADLE_FILENAME = path.resolve(process.cwd(), 'platforms', 'android', 'build.gradle');
const PACKAGE_PATTERNS = {
    PLAY_SERVICES_VERSION: /(compile "com.google.android.gms:[^:]+:)([^"]+)"/gi,
    ANDROID_SUPPORT_VERSION: /(compile "com.android.support:[^:]+:)([^"]+)"/gi
};

// 1. Parse cordova.xml file and fetch this plugin's <variable name="PLAY_SERVICES_VERSION" />
fs.readFile(path.resolve(process.cwd(), 'config.xml'), function (err, data) {
    var json = parser.parseString(data, function (err, result) {
        if (err) {
            return console.log(PLUGIN_NAME, ": ERROR: ", err);
        }
        var plugins = result.widget.plugin;
        if(!plugins || plugins.length === 0) return;
        for (var n = 0, len = plugins.length; n < len; n++) {
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

function setGradleVersion(variables) {
    console.info(PLUGIN_NAME, "TEST : "+JSON.stringify(variables));
    fs.readFile(GRADLE_FILENAME, function (err, contents) {
        if (err) {
            return console.log(PLUGIN_NAME, " ERROR: ", err);
        }

        var gradleContent = contents.toString();
        for(var i=0; i<variables.length; i++) {
            var variableName = variables[i].$.name;
            var version = variables[i].$.value;

            gradleContent = gradleContent.replace(PACKAGE_PATTERNS[variableName], "$1" + version + '"');
        }

        fs.writeFile(GRADLE_FILENAME, gradleContent, 'utf8', function (err) {
            if (err) return console.log(PLUGIN_NAME, ": FAILED TO WRITE ", GRADLE_FILENAME, " > ", JSON.stringify(variables), err);
            console.log(PLUGIN_NAME, ": WROTE ", GRADLE_FILENAME, " > ", JSON.stringify(variables));
        });
    });
}





