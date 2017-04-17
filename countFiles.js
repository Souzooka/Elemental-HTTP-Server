// Module for counting the number of files in a directory\
// in this case public/elements
// This info is used for editing public/index.html

// synchronous for now...

/*jshint esversion:6*/
function countFiles(filePath) {
  return fs.readdirSync(filePath).length;
}