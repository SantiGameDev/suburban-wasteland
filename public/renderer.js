let mikeImages = [];
for(let i = 0; i<32; i++)
    mikeImages[i] = new Image();

for(let i = 0; i<8; i++) {


    mikeImages[i].src = 'mikes/'+i+'.webp';
    mikeImages[i].onload = function(){onMikeLoad();}

    mikeImages[i+16].src = 'saberMike/'+i+'.webp';
    mikeImages[i+16].onload = function(){onMikeLoad();}

}

let mikesLoaded = 0;
let mikesInPainCreated = false;

let cactiLoaded = false;

let cactiSheet = new Image();
cactiSheet.src = 'cacti-sheet-128.webp';
cactiSheet.onload = function (){cactiLoaded = true;}

function onMikeLoad(){
    mikesLoaded++;
    if(mikesLoaded>=16)
        createMikesInPain();
}

let handImg = [];
for(let i = 0; i<=1; i++){
    handImg[i] = new Image();
    handImg[i].src = 'hands/'+i+'.webp';
}

let handToUse = 0;


function imgArrayFromSheet(img,width,height,count){
    let imgEditorCanvas = document.createElement("canvas");
    imgEditorCanvas.width = width;
    imgEditorCanvas.height = height;
    let editorCtx = imgEditorCanvas.getContext("2d");

    let out = [];
    for(let i = 0; i<count; i++){
        out[i] = new Image();
        editorCtx.clearRect(0,0,width*count,height);
        editorCtx.drawImage(img,width*i,0,width,height,0,0,width,height);

        out[i].src = imgEditorCanvas.toDataURL();
    }
    return out;
}

    function createMikesInPain(){
    console.log('started');
    let imgEditorCanvas = document.createElement("canvas");
    imgEditorCanvas.width = 382;
    imgEditorCanvas.height = 640;
    let editorCtx = imgEditorCanvas.getContext("2d");
    let indexesToHurt = [0,1,2,3,4,5,6,7,16,17,18,19,20,21,22,23];
    for(let j = 0; j<indexesToHurt.length; j++){
        i = indexesToHurt[j];
        editorCtx.clearRect(0,0,1000,1000);
        editorCtx.drawImage(mikeImages[i],0,0)
        let tempImg = editorCtx.getImageData(0,0,382,640);
        let tempImgData = tempImg.data;
        let tempImgLength = tempImgData.length;
        for(let i=0; i < tempImgLength; i+=4){
            if(tempImgData[i+3]>15){
                tempImgData[i] +=50;
            }
        }
        tempImg.data = tempImgData;
        editorCtx.putImageData(tempImg,0,0);
        mikeImages[i+8].src = imgEditorCanvas.toDataURL()
    }
    mikesInPainCreated = true;
    console.log('done!');
    imgEditorCanvas.remove();
}



function prepareForRender(){
    for(let i = 0; i<objects.length; i++){
        let thisObject = objects[i];
        if(objects[i].type == 'remotePlayer' || objects[i].type == 'cactus'){
            thisObject['x1'] = thisObject.x; thisObject['x2'] = thisObject.x;
            thisObject['y1'] = thisObject.y; thisObject['y2'] = thisObject.y;
        }
        thisObject['centerX'] = (thisObject.x1+thisObject.x2)/2;
        thisObject['centerY'] = (thisObject.y1+thisObject.y2)/2;

        thisObject['centerDistFromPlayer'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].centerX ,2)+Math.pow(localPlayer.y-objects[i].centerY,2));

        thisObject['distFromPlayer'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].x1 ,2)+Math.pow(localPlayer.y-objects[i].y1,2));
        thisObject['dirFromPlayer'] = Math.atan2(objects[i].y1 - localPlayer.y,objects[i].x1 - localPlayer.x);

        objects[i]['distFromPlayer2'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].x2 ,2)+Math.pow(localPlayer.y-objects[i].y2,2));
        objects[i]['dirFromPlayer2'] = Math.atan2(objects[i].y2 - localPlayer.y,objects[i].x2 - localPlayer.x);

        objects[i]['dirDiff'] = (localPlayer.dir - objects[i]['dirFromPlayer'] +PI + 2*PI) % (2*PI)-PI
        objects[i]['dirDiff2'] = (localPlayer.dir - objects[i]['dirFromPlayer2'] +PI + 2*PI) % (2*PI)-PI

        let wallDirTest = Math.atan2(thisObject.y1 - localPlayer.y, thisObject.x1 - localPlayer.x);
        let wallDirTest2 = Math.atan2(thisObject.y2 - localPlayer.y, thisObject.x2 - localPlayer.x);

        let angDiff = (localPlayer.dir - wallDirTest + PI + 2*PI) % (2*PI) - PI;
        let angDiff2 = (localPlayer.dir - wallDirTest2 + PI + 2*PI) % (2*PI) - PI;


            let FOVEndPoint1 = new Point((localPlayer.x + Math.cos(localPlayer.dir + FOV / 2) * 1000), (localPlayer.y + Math.sin(localPlayer.dir + FOV / 2) * 1000));
            let FOVEndPoint2 = new Point((localPlayer.x + Math.cos(localPlayer.dir - FOV / 2) * 1000), (localPlayer.y + Math.sin(localPlayer.dir - FOV / 2) * 1000));
            let originPoint = new Point(localPlayer.x, localPlayer.y);
            let wallPoint1 = new Point(thisObject['x1'],thisObject['y1']); let wallPoint2 = new Point(thisObject['x2'],thisObject['y2']);
            thisObject['inFOV'] = ((angDiff>0-FOV/2&&angDiff<FOV/2) || (angDiff2>0-FOV/2&&angDiff2<FOV/2)) || (doIntersect(originPoint,FOVEndPoint1,wallPoint1,wallPoint2));


    }

    objectsToRender = [];  //this bit of code fills the array with indexes of objects, sorted by distance from player
    let objectsCopy = objects.slice();
    for(let i = 0; i<objects.length; i++)
        objectsToRender[i] = i;

    for(let i = 0; i<objects.length; i++){
        for(let j = i; j<objects.length; j++){
            if(objectsCopy[j]['centerDistFromPlayer']>objectsCopy[i]['centerDistFromPlayer']){
                let iWas = objectsCopy[i];
                objectsCopy[i] = objectsCopy[j];
                objectsCopy[j] = iWas;
                let indIWas = objectsToRender[i];
                objectsToRender[i] = objectsToRender[j];
                objectsToRender[j] = indIWas;
            }
        }
    }

}
let topDownScale = 3;
function renderTopDown(showWallLines){

    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.rect(0,0,1000,1000);
    ctx.fill();
    ctx.closePath();

    for(let i = 0; i<objects.length; i++){
        //   if(objects[i].type=='wall'){
        ctx.strokeStyle = objects[i]['color'];
        ctx.beginPath();
        ctx.moveTo(objects[i].x1/topDownScale,objects[i].y1/topDownScale);
        ctx.lineTo(objects[i].x2/topDownScale,objects[i].y2/topDownScale);
        ctx.stroke();
        ctx.closePath();

        if(objects[i].inFOV && showWallLines){
            ctx.strokeStyle = "#31ffa5";
            ctx.beginPath();
            ctx.moveTo(localPlayer.x/topDownScale,localPlayer.y/topDownScale);
            ctx.lineTo((localPlayer.x +Math.cos(objects[i]['dirFromPlayer'])*objects[i]['distFromPlayer'])/topDownScale,(localPlayer.y +Math.sin(objects[i]['dirFromPlayer'])*objects[i]['distFromPlayer'])/topDownScale);
            ctx.stroke();
            ctx.closePath();
        }

        if(objects[i].type=='remotePlayer'){
            ctx.fillStyle = "#eead62";
            ctx.beginPath();
            ctx.rect((objects[i].x-3)/topDownScale,(objects[i].y-3)/topDownScale,6,6);
            ctx.fill();
            ctx.closePath();
        }

    }

    ctx.fillStyle = "#50a142"; //local player
    ctx.beginPath();
    ctx.rect((localPlayer.x-2)/topDownScale,(localPlayer.y-2)/topDownScale,4,4);
    ctx.fill();
    ctx.closePath();

if(showWallLines) {
    ctx.beginPath();
    ctx.moveTo(localPlayer.x / topDownScale, localPlayer.y / topDownScale);
    ctx.lineTo((localPlayer.x + Math.cos(localPlayer.dir - FOV / 2) * 1000) / topDownScale, (localPlayer.y + Math.sin(localPlayer.dir - FOV / 2) * 1000) / topDownScale);
    ctx.stroke();
    ctx.moveTo(localPlayer.x / topDownScale, localPlayer.y / topDownScale);
    ctx.lineTo((localPlayer.x + Math.cos(localPlayer.dir + FOV / 2) * 1000) / topDownScale, (localPlayer.y + Math.sin(localPlayer.dir + FOV / 2) * 1000) / topDownScale);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.closePath();
}
}

const magicViewNumber = 0.6;
const magicViewNumber2 = 5000;
function render3D(){
    for(let i = 0; i<objectsToRender.length; i++){
        let theObject = objects[objectsToRender[i]];
        if(theObject.inFOV){

            let topViewNumber = magicViewNumber2*theObject['height'];
            let bottomViewNumber = magicViewNumber2;
            topViewNumber+= theObject['z']*magicViewNumber2;
            bottomViewNumber-= theObject['z']*magicViewNumber2;

            let planeXStart = (0-theObject['dirDiff'] + magicViewNumber) / (magicViewNumber*2)*screen.width;
            let planeXEnd = (0-theObject['dirDiff2'] + magicViewNumber) / (magicViewNumber*2)*screen.width;
            let planeYStart = magicViewNumber2/theObject['distFromPlayer'];
            let planeYEnd = magicViewNumber2/theObject['distFromPlayer2'];

            let planeYStart2 = topViewNumber/theObject['distFromPlayer']; //tops
            let planeYEnd2 = topViewNumber/theObject['distFromPlayer2'];

            let planeYStart3 = bottomViewNumber/theObject['distFromPlayer']; //bottoms
            let planeYEnd3 = bottomViewNumber/theObject['distFromPlayer2'];

            let lowerYStart = screen.height/2-planeYStart;
            let lowerYEnd = screen.height/2-planeYEnd;
            let upperYStart = screen.height/2+planeYStart;
            let upperYEnd = screen.height/2+planeYEnd;



            if(theObject.type == 'wall'){
                lowerYStart = screen.height/2-planeYStart2;
                lowerYEnd = screen.height/2-planeYEnd2;
                upperYStart = screen.height/2+planeYStart3;
                upperYEnd = screen.height/2+planeYEnd3;


                ctx.beginPath();
                ctx.fillStyle = theObject.color;
                ctx.moveTo(planeXEnd,lowerYEnd);
                ctx.lineTo(planeXEnd,upperYEnd);
                ctx.lineTo(planeXStart,upperYStart);
                ctx.lineTo(planeXStart,lowerYStart)
                ctx.lineTo(planeXEnd,lowerYEnd);
                ctx.fill();
                if('outlineColor' in theObject){
                    ctx.strokeStyle = theObject.outlineColor;
                    ctx.stroke();
                }
                ctx.closePath();
            }


            if(theObject.type == 'remotePlayer'){
                let viewingAngle = (theObject['dirFromPlayer']+PI); //0-2PI value

                viewingAngle-= 15/radToDeg;

                let imgToShow = (Math.floor((0-(viewingAngle-(theObject['dir']))/6.28*8))+ 8 )% 8;

                let mikeWidth = 0.8*(upperYStart-lowerYStart);
                let mikeHeight = 1*(upperYStart-lowerYStart);

                while(imgToShow<0){
                    imgToShow+=8;
                    imgToShow%=8;
                }

                let drawX = planeXStart-mikeWidth/2;
                let drawY = (lowerYStart+mikeHeight/8);  // the +mikeHeight/8 makes them more eye-level
                let drawWidth = mikeWidth;
                let drawHeight = mikeHeight;
                if(theObject['crouching']){
                    drawHeight/=2;
                    drawY+=mikeHeight/2;
                }

                if(theObject['inPain'])
                    imgToShow+=8;
                if(theObject['weaponHeld']==2)
                    imgToShow+=16;

                //   if(imgToShow>=0 && (imgToShow<8 || (mikesInPainCreated && imgToShow<16))){
                ctx.fillStyle = "rgba(255,255,255,0.6)";
                ctx.font = drawHeight/12+'px Comic Sans MS';
                let remoteName = theObject['name'];
                ctx.fillText(remoteName,drawX+drawWidth/2-ctx.measureText(remoteName).width/2,drawY)

                if(mikesInPainCreated)
                ctx.drawImage(mikeImages[imgToShow],drawX,drawY,drawWidth,drawHeight);

                //    }else{
                //        console.log('mike image out of bounds: '+imgToShow);
                //   }


            }

            if(theObject.type == 'cactus'){
           //     console.log(theObject)
                let totalImgCount = 127;
                let viewingAngle = (theObject['dirFromPlayer']+PI); //0-2PI value

              //  viewingAngle-=1/radToDeg; //only needed for mike model

                let imgToShow = (Math.floor((0-(viewingAngle-(theObject['dir']))/6.28*totalImgCount))+ totalImgCount )% totalImgCount;

                let mikeWidth = 0.8*(upperYStart-lowerYStart);
                let mikeHeight = 1*(upperYStart-lowerYStart);

                while(imgToShow<0){
                    imgToShow+=totalImgCount;
                    imgToShow%=totalImgCount;
                }

                let drawX = planeXStart-mikeWidth/2;
                let drawY = (lowerYStart+mikeHeight/8);  // the +mikeHeight/8 makes them more eye-level
                let drawWidth = mikeWidth;
                let drawHeight = mikeHeight;

                imgToShow = totalImgCount - imgToShow;

                if(cactiLoaded)
                    ctx.drawImage(cactiSheet,imgToShow*460/4.25,0,460/4.25,200,drawX,drawY,drawWidth,drawHeight);
                // ctx.drawImage(cactiImages[imgToShow],drawX,drawY,drawWidth,drawHeight);


                //    }else{
                //        console.log('mike image out of bounds: '+imgToShow);
                //   }


            }

        }



    }
   // ctx.drawImage(handImg[handToUse],0,handY,screen.width,200);
}

function fillSky(){
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.rect(0,0,1000,screen.height/2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "#969696";
    ctx.beginPath();
    ctx.rect(0,screen.height/2,1000,1000);
    ctx.fill();
    ctx.closePath();
}