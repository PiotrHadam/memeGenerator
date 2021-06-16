import { AfterViewInit, Component, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColorEvent } from 'ngx-color';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements AfterViewInit{
  
  @ViewChild('memeCanvas', { static: false }) myCanvas: any;

  topText: string = '';
  bottomText: string = '';
  textSize: string = '50px';
  fileEvent: any;
  textColor: string = '#000000';
  bgColor: string = '#F9F9FB';
  fontSizes: Font[] = [
    {display: "20", value: "20px "},
    {display: "25", value: "25px "},
    {display: "30", value: "30px "},
    {display: "35", value: "35px "},
    {display: "40", value: "40px "},
    {display: "45", value: "45px "},
    {display: "50", value: "50px "},
    {display: "55", value: "55px "},
    {display: "60", value: "60px "},
  ];
  selectedFontSize: string = {display: "45", value: "45px Comic Sans MS"}.value;
  fonts: string[] = [
    "Comic Sans MS",
    "Courier New",
    "Gill Sans",
    "Lucida Sans",
    "Times New Roman"
  ];
  selectedFont: string = "Comic Sans MS";
  font: string = "45px Comic Sans MS";

  // rysowanie
  canvasWidth: number = 700;
  canvasHeight: number = 800;
  ctxD: any;
  canvasD: any;
  currentTool: string = 'brush';
  usingBrush: boolean = false;
  shapeBoundingBox = new ShapeBoundingBox(0,0,0,0);
  loc = new Location(0,0)
  mousedown = new MouseDownPos(0,0);
  savedImageData: any;
  dragging: boolean = false;
  brushXPoints = new Array();
  brushYPoints = new Array();
  brushDownPos = new Array();
  strokeColor: string = 'black';
  fillColor: string = 'black';
  lineSizes = [
    "2",
    "4",
    "6",
    "8",
    "10"
  ]
  selectedLineSize: string = "2"

  constructor() {
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
  }

  //rysowanie pobranego obrazu na canvas
  preview(e:any){
    this.fileEvent = e;

    let canvas = this.myCanvas.nativeElement;
    let ctx = canvas.getContext('2d');

    let render = new FileReader();
    render.readAsDataURL(e.target.files[0]);
    
    render.onload = function (event) {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = function () {      
        let width = img.width;
        let height = img.height;
        if (width > height){
          height = (height * 600) / width;
          width = 600; 
        }
        else if (width < height){
          width = (width * 600) / height;
          height = 600;      
        }
        else{
          width = 600;
          height = 600;
        }
        ctx.drawImage(img, ((canvas.width - width)/2), ((canvas.height - height)/2), width, height);        
      }
    }
  }

  //pisanie tekstu
  drawText(){
    let canvas = this.myCanvas.nativeElement;
    let ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); //czyszczenie canvasa, żeby tekst mógł być wyśrodkowany

    ctx.fillStyle = this.bgColor; //zmiana koloru tła
    ctx.fillRect(0, 0, canvas.width, canvas.height); //wypełnienie canvasa
    
    try {
      this.preview(this.fileEvent); //wczytanie obrazu od nowa
    } catch (error) { }

    //pisanie
    ctx.fillStyle = this.textColor;
    ctx.font = this.font;
    
    ctx.textAlign = 'center';
    ctx.fillText(this.topText, canvas.width/2, 75);
    ctx.fillText(this.bottomText, canvas.width/2, 750);
  }

  //zmiana koloru tekstu - odświeżenie obrazu
  canvasTextColor($event: ColorEvent){
    this.textColor = $event.color.hex;
    this.drawText();
  }

  //zmiana wielkości czcionki
  changeFontSize($event:any){
    this.selectedFontSize = $event.target.value;
    this.font = this.selectedFontSize + this.selectedFont;
    this.drawText();
  }

  //zmiana czcionki
  changeFont($event:any){
    this.selectedFont = $event.target.value;   
    this.font = this.selectedFontSize + this.selectedFont; 
    this.drawText();
  }

  //zmiana koloru tła - odświeżenie obrazu
  canvasBgColor($event: ColorEvent){
    this.bgColor = $event.color.hex;
    this.drawText();
  }

  //RYSOWANIE
  //ustawienie canvasa
  setupCanvas(){
    this.canvasD = this.myCanvas.nativeElement;
    this.ctxD = this.canvasD.getContext('2d');
    
    this.ctxD.strokeStyle = this.strokeColor;
    this.ctxD.lineWidth = this.selectedLineSize;
  }

  //pobranie pozycji myszy
  GetMousePosition(x:any,y:any){    
    let canvasSizeData = this.canvasD.getBoundingClientRect();
    return { x: (x - canvasSizeData.left) * (this.canvasD.width  / canvasSizeData.width),
        y: (y - canvasSizeData.top)  * (this.canvasD.height / canvasSizeData.height)
      };
  }

  //zapisanie obrazu narysowanego na canvasie
  SaveCanvasImage(){
    this.savedImageData = this.ctxD.getImageData(0,0,this.canvasD.width,this.canvasD.height);
  }

  //przerysowanie obrazu
  RedrawCanvasImage(){
    this.ctxD.putImageData(this.savedImageData,0,0);
  }

  //zmiana koloru rysowania
  canvasDrawingColor($event: ColorEvent){
    this.strokeColor = $event.color.hex;
  }

  //zmiana grubości linii
  changeLineSize($event:any){
    this.selectedLineSize = $event.target.value;
  }

  //aktualizacja rozmiaru kształtu rysowanego (linii, koła, prostokąta, elipsy)
  UpdateRubberbandSizeData(loc: any){
    this.shapeBoundingBox.width = Math.abs(loc.x - this.mousedown.x);
    this.shapeBoundingBox.height = Math.abs(loc.y - this.mousedown.y);
 
    if(loc.x > this.mousedown.x){
         this.shapeBoundingBox.left = this.mousedown.x;
    } else {
         this.shapeBoundingBox.left = loc.x;
    }
 
    if(loc.y > this.mousedown.y){
        this.shapeBoundingBox.top = this.mousedown.y;
    } else {
        this.shapeBoundingBox.top = loc.y;
    }
  }

  //rysowanie kształtu
  drawRubberbandShape(loc:any){
    this.ctxD.strokeStyle = this.strokeColor;
    this.ctxD.fillStyle = this.fillColor;
    this.ctxD.lineWidth = this.selectedLineSize;
    
    if(this.currentTool === "brush"){
        this.DrawBrush();
    } else if(this.currentTool === "line"){
        this.ctxD.beginPath();
        this.ctxD.moveTo(this.mousedown.x, this.mousedown.y);
        this.ctxD.lineTo(loc.x, loc.y);
        this.ctxD.stroke();
    } else if(this.currentTool === "rectangle"){
        this.ctxD.strokeRect(this.shapeBoundingBox.left, this.shapeBoundingBox.top, this.shapeBoundingBox.width, this.shapeBoundingBox.height);
    } else if(this.currentTool === "circle"){
        let radius = this.shapeBoundingBox.width;
        this.ctxD.beginPath();
        this.ctxD.arc(this.mousedown.x, this.mousedown.y, radius, 0, Math.PI * 2);
        this.ctxD.stroke();
    } else if(this.currentTool === "ellipse"){
        let radiusX = this.shapeBoundingBox.width / 2;
        let radiusY = this.shapeBoundingBox.height / 2;
        this.ctxD.beginPath();
        this.ctxD.ellipse(this.mousedown.x, this.mousedown.y, radiusX, radiusY, Math.PI / 4, 0, Math.PI * 2);
        this.ctxD.stroke();
    }
  }
  
  //aktualizacja kształtu podczas ruchu
  UpdateRubberbandOnMove(loc:any){
    this.UpdateRubberbandSizeData(loc);
 
    this.drawRubberbandShape(loc);
  }

  //dodanie punktu rysowania
  AddBrushPoint(x:any, y:any, mouseDown:any){
    this.brushXPoints.push(x);
    this.brushYPoints.push(y);
    this.brushDownPos.push(mouseDown);
  }

  //rysowanie ołówkiem
  DrawBrush(){
    for(let i = 1; i < this.brushXPoints.length; i++){
        this.ctxD.beginPath();
 
        if(this.brushDownPos[i]){
            this.ctxD.moveTo(this.brushXPoints[i-1], this.brushYPoints[i-1]);
        } else {
            this.ctxD.moveTo(this.brushXPoints[i]-1, this.brushYPoints[i]);
        }
        this.ctxD.lineTo(this.brushXPoints[i], this.brushYPoints[i]);
        this.ctxD.closePath();
        this.ctxD.stroke();
    }
  }

  //reakcja na kliknięcie myszą
  ReactToMouseDown(e:MouseEvent){
    this.canvasD.style.cursor = "crosshair";
    this.loc = this.GetMousePosition(e.clientX, e.clientY);
    this.SaveCanvasImage();
    this.mousedown.x = this.loc.x;
    this.mousedown.y = this.loc.y;
    this.dragging = true;

    if(this.currentTool === 'brush'){
        this.usingBrush = true;
        this.AddBrushPoint(this.loc.x, this.loc.y, false);
    }
  };

  //reakcja na ruch myszy
  ReactToMouseMove(e:any){
    this.canvasD.style.cursor = "crosshair";
    this.loc = this.GetMousePosition(e.clientX, e.clientY);    

    if(this.currentTool === 'brush' && this.dragging && this.usingBrush){
        if(this.loc.x > 0 && this.loc.x < this.canvasWidth && this.loc.y > 0 && this.loc.y < this.canvasHeight){
            this.AddBrushPoint(this.loc.x, this.loc.y, true);
        }
        this.RedrawCanvasImage();
        this.DrawBrush();
    } else {
        if(this.dragging){
            this.RedrawCanvasImage();
            this.UpdateRubberbandOnMove(this.loc);
        }
    }
  };

  //reakcja na puszczenie przycisku myszy
  ReactToMouseUp(e:any){
    this.canvasD.style.cursor = "default";
    this.loc = this.GetMousePosition(e.clientX, e.clientY);
    this.RedrawCanvasImage();
    this.UpdateRubberbandOnMove(this.loc);
    this.dragging = false;
    this.usingBrush = false;
  }

  //zmiana narzędzia do rysowania
  changeTool(toolClicked:any){
    this.currentTool = toolClicked;
  }

  //pobranie gotowego obrazu
  downloadImg(){
    let canvas = this.myCanvas.nativeElement;

    let image = canvas.toDataURL('image/png');

    let link = document.createElement('a');
    link.download = 'memeImg.png';
    link.href = image;
    link.click();
  }
}

class ShapeBoundingBox{
  left: any;
  top: any;
  width: any;
  height: any;
  constructor(left:any, top:any, width:any, height:any) {
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
  }
}

class Location{
  x: any;
  y: any;
  constructor(x:any, y:any) {
      this.x = x,
      this.y = y;
  }
}

class MouseDownPos{
  x: any;
  y: any;
  constructor(x:any,y:any) {
      this.x = x,
      this.y = y;
  }
}

interface Font{
  display: string;
  value: string;
}