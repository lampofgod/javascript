const ribbonDataMap = new Map();
// First ribbon (credit: https://nuuneoi.com/blog/884/black_ribbons.zip)
ribbonDataMap.set("black_ribbon_1", {
	width: 123
	,height: 123
	,srcTopLeft: "black_ribbon_top_left.png"
	,srcTopRight: "black_ribbon_top_right.png"
	,srcBottomLeft: "black_ribbon_bottom_left.png"
	,srcBotomRight: "black_ribbon_bottom_right.png"
});

// Second ribbon (credit: https://www.facebook.com/jibbazee/posts/10153967020642895)
ribbonDataMap.set("black_ribbon_2", {
	width: 48
	,height: 68
	,srcTopLeft: "ribbon-black_68.png"
	,srcTopRight: "ribbon-black_68.png"
	,srcBottomLeft: "ribbon-black_68.png"
	,srcBotomRight: "ribbon-black_68.png"
});

class RibbonOverImgData{ // abstract class
		
	constructor(overImgObj){			
		this.width = 0;
		this.height = 0; 		
			
		this.baseURL = "img";
		this.setRibbonData("black_ribbon_1");  // defalt
		this.setTopLeftRibbon(); 			    // default
	}		

	addOverImgData(overImgObj){
		this.width = overImgObj.width;
		this.height = overImgObj.height;
	}

	setRibbonData(key){
		this.ribbonData = ribbonDataMap.get(key);			
	}

	setTopLeftRibbon(){
		this.ribbonPicLink = `${this.baseURL}/${this.ribbonData.srcTopLeft}`;
		this.xRibbon= 0;
		this.yRibbon= 0;
	}

	setTopRightRibbon(){		
		this.ribbonPicLink =  `${this.baseURL}/${this.ribbonData.srcTopRight}`;
		this.xRibbon= this.width - this.ribbonData.width;
		this.yRibbon= 0;
	}

	setBottomLeftRibbon(){
		this.ribbonPicLink =  `${this.baseURL}/${this.ribbonData.srcBottomLeft}`;
		this.xRibbon= 0;
		this.yRibbon= this.height - this.ribbonData.height;
	}


	setBottomRightRibbon(){
		this.ribbonPicLink = `${this.baseURL}/${this.ribbonData.srcBotomRight}`;
		this.xRibbon= this.width - this.ribbonData.width;
		this.yRibbon= this.height - this.ribbonData.height;
	}

	getData(){		 
		return {ribbonSrc: this.ribbonPicLink, xRibbon: this.xRibbon, yRibbon: this.yRibbon}; // return the object
	}
	
}

class Drawing { // Abstract class		
	constructor(divTargetId){
		if (new.target === Drawing) {// Not allow new Drawing
      		throw new TypeError("Cannot construct Abstract instances directly");
    	}
		this.divId = `#${divTargetId}`;
	}
		
	///////////////////////////////////////////////////////
	//************** Internal methods ********************

	_addTextToCanvas(text, canvas){
		let canvasContext = canvas.getContext("2d");
		canvasContext.font = "13pt Calibri"; // size and font
		canvasContext.textAlign = 'center';  // position
		canvasContext.fillText(text, canvas.width/2, canvas.height-10);	
	}
	
	_addCanvasToDiv(canvas){
		$(this.divId).empty();
		
		// Template String in ES6
		let aLink = `<br/><p>คลิกขวาที่รูปแล้ว Save รูป หรือ <a href="${canvas.toDataURL()}" download="yourprofile.png">จะกดดาวน์โหลดรูปที่นี้!</a></p>`;
		$(this.divId).html(aLink);
		$(this.divId).append(canvas);	// Final picture will show
	}

	////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////		

	drawImageToCanvas(imgObj){ // Child class will override this method later
	}

	drawNotFoundImg(){
		let img = new Image();				
						
		img.onload = () => {
			let canvas = document.createElement('canvas');							
			let canvasContext = canvas.getContext("2d");
			canvas.width = img.width;
			canvas.height = img.height;

			canvasContext.drawImage(img, 0, 0);		
			this._addCanvasToDiv(canvas);			
		}

		img.src = "src/img/no-imgae-result.png";
	}

} 

class GrayDrawing extends Drawing {
	constructor(divTargetId){
		super(divTargetId);
	}

	// **************** Internal methods *****************
	//////////////////////////////////////////////////////
	// Credit this source code: http://www.ajaxblender.com/howto-convert-image-to-grayscale-using-javascript.html	
	_grayscaleImage(imgObj){ // Convert a picture to black and white that support with other browser (except IE)
		let canvas = document.createElement('canvas');
		let canvasContext = canvas.getContext('2d');
        
		let imgW = imgObj.width;
		let imgH = imgObj.height;
		canvas.width = imgW;
		canvas.height = imgH;
        
		canvasContext.drawImage(imgObj, 0, 0);
		let imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);
        
		for(let y = 0; y < imgPixels.height; y++){
			for(let x = 0; x < imgPixels.width; x++){
				let i = (y * 4) * imgPixels.width + x * 4;
				let avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
				imgPixels.data[i] = avg; 
				imgPixels.data[i + 1] = avg; 
				imgPixels.data[i + 2] = avg;
			}
		}
        
		canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);		
		return canvas.toDataURL();
	}
	
	// Covert to black and white for IE only, Recommended from http://www.ajaxblender.com/howto-convert-image-to-grayscale-using-javascript.html
	_grayscaleImageIE(imgObj){
		imgObj.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(grayScale=1)';
	}
	
	_convertToGrayImage(imgObj){		
		if (navigator.userAgent.match("MSIE")){	// Is browser IE or not
			console.log("....Coverting a image to gray scale (Support IE web browser)");							
			this._grayscaleImageIE(imgObj);
			return imgObj.src;	
		} else {				
			console.log("....Coverting a image to gray scale");				
			return this._grayscaleImage(imgObj);		
		}           
		
	}
	//////////////////////////////////////////////////////
	//////////////////////////////////////////////////////
	
	drawImageToCanvas(imgObj){			
		let grayImg = new Image();						
						
		grayImg.onload = () => { 	// Use arrow function to bind this, super at here
					
			let canvas = document.createElement('canvas');							
			let canvasContext = canvas.getContext("2d");
			canvas.width = grayImg.width;
			canvas.height = grayImg.height;				
							
			console.log("....drawing the gray image");			
			canvasContext.drawImage(grayImg, 0, 0);						
				
			super._addTextToCanvas("ตัวอย่างการทำภาพโทนสีเทา", canvas);							
			super._addCanvasToDiv(canvas);			
		};	

		grayImg.src = this._convertToGrayImage(imgObj);	// Load black and white picture
	}	
}

class RibbonDrawing extends Drawing {

	constructor(divTargetId, ribbonData){
		super(divTargetId);		
		this.ribbonData = ribbonData;
	}
	
	drawImageToCanvas(imgObj){
		let ribbonImg = new Image();		

		// initialize variables in ES6
		let {ribbonSrc, xRibbon, yRibbon} = this.ribbonData.getData();	

		ribbonImg.onload = () => {		//  Use arrow function to bind this, super at here
				
			let canvas = document.createElement('canvas');							
			let canvasContext = canvas.getContext("2d");
			canvas.width = imgObj.width;
			canvas.height = imgObj.height;				
							
			console.log("....drawing the ribbon on the image");			
			canvasContext.drawImage(imgObj, 0, 0);		            // Draw first picture
			canvasContext.drawImage(ribbonImg, xRibbon, yRibbon); 	// Draw second picture over the first one
				
			super._addTextToCanvas("ตัวอย่างการทำภาพติดริบบิ้นสีดำ", canvas);					
			super._addCanvasToDiv(canvas);							
		};				
			
		
		ribbonImg.src = ribbonSrc; // Load picture of the ribbon
	}
}

class GrayRibbonDrawing extends GrayDrawing {
	constructor(divTargetId, ribbonData){
		super(divTargetId);
		this.ribbonData = ribbonData;
	}

	drawImageToCanvas(imgObj){		
		let grayImg = new Image();			
		let ribbonImg = new Image();		

		// initialize variables in ES6
		let {ribbonSrc, xRibbon, yRibbon} = this.ribbonData.getData();

		grayImg.onload = () => {			//  Use arrow function to bind this, super at here
			console.log("....loading first image");							
				
			ribbonImg.onload = () => {		// Use arrow function to this, super at here
				console.log("....loading second image");	
				
				let canvas = document.createElement('canvas');							
				let canvasContext = canvas.getContext("2d");
				canvas.width = grayImg.width;
				canvas.height = grayImg.height;				
							
				console.log("....drawing the ribbon on the gray image");			
				canvasContext.drawImage(grayImg, 0, 0);		            // Draw first picture
				canvasContext.drawImage(ribbonImg, xRibbon, yRibbon); 	// Draw second picture over the first one
				
				super._addTextToCanvas("ตัวอย่างการทำภาพโทนสีเทา และติดริบบิ้นสีดำ", canvas);					
				super._addCanvasToDiv(canvas);				
			};							
			
			ribbonImg.src = ribbonSrc;				
		};			
			

		grayImg.src = super._convertToGrayImage(imgObj); 	// Load picture 
	}
}

class DrawingState{
	constructor(imgId, divTargetId){		
		this.imgId =  `#${imgId}`;
		this.ribbonData = new RibbonOverImgData();

		this.grayDrawing = new GrayDrawing(divTargetId);
		this.ribbonDrawing = new RibbonDrawing(divTargetId, this.ribbonData);
		this.grayRibbonDrawing = new GrayRibbonDrawing(divTargetId, this.ribbonData);
		
		this.drawing = this.grayDrawing; // default
	}

	drawImage(){
		let imgObj = document.querySelector(this.imgId);	// Image object		
		this.ribbonData.addOverImgData(imgObj); // Set position of the ribbon on the image
		this.drawing.drawImageToCanvas(imgObj);
	}

	clearImage(){
		this.drawing.drawNotFoundImg();
	}
		
	/////////////////////////////
	//////// Draw the image in many style /////////
	setGrayDrawing(){
		this.drawing = this.grayDrawing;
	}	
	
	setRibbonDrawing(){
		this.drawing = this.ribbonDrawing;												
	}
	
	setGrayRibbonDrawing(){
		this.drawing = this.grayRibbonDrawing;	
	}
	///////////////////////////

	setRibbionStyle(key){ // sytle of the ribbon
		this.ribbonData.setRibbonData(key);
	}
	///////////////////////////////
	// Change position of the ribbon
	setTopLeftRibbon(){		
		this.ribbonData.setTopLeftRibbon();
	}

	setTopRightRibbon(){
		this.ribbonData.setTopRightRibbon();
	}

	setBottomLeftRibbon(){ 
		this.ribbonData.setBottomLeftRibbon();
	}

	setBottomRightRibbon(){
		this.ribbonData.setBottomRightRibbon();
	}
	/////////////////////////
	
}
