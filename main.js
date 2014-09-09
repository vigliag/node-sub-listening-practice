var videoPath = process.argv[2];
if(!videoPath){
	console.error("file not specified");
	process.exit(-1);
}

console.log("videoPath", videoPath);
