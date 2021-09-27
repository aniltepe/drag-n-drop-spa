import {
    Component, OnInit, ViewContainerRef, ViewChild, ComponentFactoryResolver,
    AfterViewInit, ComponentRef, ChangeDetectorRef
  } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Create } from './app.create';
  import { Remove } from './app.remove';
  import { Note, Chord, CustomSet, Scale, SetTemplate, Constants, Interval, ChordType, ItemType } from 'src/models';
  import { NoteComponent, ChordComponent, CustomSetComponent } from '../components';
  
  @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
  export class AppComponent implements OnInit, AfterViewInit {
    NOTE_NAMES: string[];
    OCTAVES: number[];
    CHORD_TYPES: string[];
    TUNINGS: number[];
    TIME_SIGNATURES: [number, number][];
  
    allSetTemplates: SetTemplate[];
    menuSetTemplates: SetTemplate[];
    menuIntervals: Interval[];
  
    tuning: number;
    tempo: number;
    timeSig: [number, number];
    mute: boolean = true;
    metronomeOn: boolean = false;
  
    allComponentsOnDesk: ComponentRef<any>[] = [];
  
    selection: number = -1;
    private createListOpen: boolean = false;
    private mouseOnTempoPopup: boolean = false;
    private mouseOnTuningPopup: boolean = false;
    private mouseOnTimeSigPopup: boolean = false;
    private draggedItem: HTMLElement;
    private combinedElements: [HTMLElement, HTMLElement];
    keyPressHandle;
  
    @ViewChild('appDesk', { read: ViewContainerRef, static: false }) desk: ViewContainerRef;
  
    constructor(private httpClient: HttpClient, private componentFactoryResolver: ComponentFactoryResolver, private changeDetectorRef: ChangeDetectorRef) { }
  
    ngOnInit() {
      this.tempo = Constants.tempo;
      this.tuning = Constants.tuning;
      this.timeSig = Constants.timeSig;
      this.NOTE_NAMES = Constants.NOTE_NAMES;
      this.OCTAVES = Constants.OCTAVES;
      this.CHORD_TYPES = Constants.CHORD_TYPES;
      this.TUNINGS = Constants.TUNINGS;
      this.TIME_SIGNATURES = Constants.TIME_SIGNATURES;
  
      this.httpClient.get("../assets/chord-templates.json").subscribe(data => {
        this.allSetTemplates = data as SetTemplate[];
        this.menuSetTemplates = this.allSetTemplates.filter(t => t.type == ChordType.Triad);
        Constants.CHORD_TEMPLATES = this.allSetTemplates;
  
        this.httpClient.get("../assets/intervals.json").subscribe(data => {
          Constants.INTERVALS = data as Interval[];
          this.menuIntervals = Constants.INTERVALS.filter(i => i.semitone > 0 && i.semitone < 12);
        });
      });
  
      let _this = this;
      this.keyPressHandle = function (e: KeyboardEvent) {
        if (e.keyCode == 13) {
          _this.CreatePopupCreateButtonOnClick();
        }
      };
    }
    ngAfterViewInit() {
      Constants.desk = this.desk;
      Constants.noteFactory = this.componentFactoryResolver.resolveComponentFactory(NoteComponent);
      Constants.chordFactory = this.componentFactoryResolver.resolveComponentFactory(ChordComponent);
      Constants.customSetFactory = this.componentFactoryResolver.resolveComponentFactory(CustomSetComponent);
      Constants.changeDetectorRef = this.changeDetectorRef;
    }
  
    UndoOnClick = () => {
  
    }
    UndoOnMouseEnter = () => {
      let tooltip: HTMLElement = document.getElementById("toolbar-undo-tooltip");
      tooltip.style.display = "block";
    }
    UndoOnMouseLeave = () => {
      let tooltip: HTMLElement = document.getElementById("toolbar-undo-tooltip");
      tooltip.style.display = "none";
    }
  
    RedoOnClick = () => {
  
    }
    RedoOnMouseEnter = () => {
      let tooltip: HTMLElement = document.getElementById("toolbar-redo-tooltip");
      tooltip.style.display = "block";
    }
    RedoOnMouseLeave = () => {
      let tooltip: HTMLElement = document.getElementById("toolbar-redo-tooltip");
      tooltip.style.display = "none";
    }
  
    CreateOnClick = (e: MouseEvent) => {
      if (this.createListOpen) {
        this.createListOpen = false;
      }
      else {
        this.createListOpen = true;
        let createList: HTMLElement = document.getElementById("create-list");
        let _this = this;
        let clickHandle = function (e: MouseEvent) {
          if (e.target != createList && (<HTMLElement>e.target).parentElement != createList) {
            _this.createListOpen = false;
            window.removeEventListener("click", clickHandle);
          }
        };
        e.stopPropagation();
        window.addEventListener("click", clickHandle);
        this.CreateOnMouseLeave();
      }
    }
    CreateOnMouseEnter = () => {
      if (!this.createListOpen) {
        let tooltip: HTMLElement = document.getElementById("toolbar-create-tooltip");
        tooltip.style.display = "block";
      }
    }
    CreateOnMouseLeave = () => {
      let tooltip: HTMLElement = document.getElementById("toolbar-create-tooltip");
      tooltip.style.display = "none";
    }
    CreateListOnClick = (e: any) => {
      let spanEl = <HTMLElement>e.currentTarget;
      let selection = spanEl.getAttribute("selection");
      this.selection = parseInt(selection);
      window.addEventListener("keypress", this.keyPressHandle);
      this.createListOpen = false;
    }
  
    MuteOnClick = (e: any) => {
      let imgEl = <HTMLImageElement>e.currentTarget;
      if (this.mute) {
        this.mute = false;
        imgEl.setAttribute("src", "../assets/images/mute-off.png");
      }
      else {
        this.mute = true;
        imgEl.setAttribute("src", "../assets/images/mute-on.png");
      }
    }
    MuteOnMouseEnter = () => {
      let tooltip: HTMLElement = document.getElementById("toolbar-mute-tooltip");
      tooltip.style.display = "block";
    }
    MuteOnMouseLeave = () => {
      let tooltip: HTMLElement = document.getElementById("toolbar-mute-tooltip");
      tooltip.style.display = "none";
    }
  
    MetronomeOnClick = (e: any) => {
      let imgElmnt = <HTMLImageElement>e.currentTarget;
      if (this.metronomeOn) {
        this.metronomeOn = false;
        imgElmnt.setAttribute("src", "../assets/images/metronome-off.png");
      }
      else {
        this.metronomeOn = true;
        imgElmnt.setAttribute("src", "../assets/images/metronome-on.png");
      }
    }
    MetronomeOnMouseEnter = () => {
      let tooltip: HTMLElement = document.getElementById("toolbar-metronome-tooltip");
      tooltip.style.display = "block";
    }
    MetronomeOnMouseLeave = () => {
      let tooltip: HTMLElement = document.getElementById("toolbar-metronome-tooltip");
      tooltip.style.display = "none";
    }
  
    TempoButtonOnMouseEnter = () => {
      let tempoPopup: HTMLElement = document.getElementById("tempo-popup");
      tempoPopup.style.display = "block";
      this.TuningPopupOnMouseLeave();
      this.TimeSigPopupOnMouseLeave();
    }
    TempoButtonOnMouseLeave = () => {
      let _this = this;
      setTimeout(function () {
        if (!_this.mouseOnTempoPopup) {
          let tempoPopup: HTMLElement = document.getElementById("tempo-popup");
          tempoPopup.style.display = "none";
        }
      }, 400);
    }
    TempoPopupOnMouseEnter = () => {
      this.mouseOnTempoPopup = true;
    }
    TempoPopupOnMouseLeave = () => {
      this.mouseOnTempoPopup = false;
      let tempoPopup: HTMLElement = document.getElementById("tempo-popup");
      tempoPopup.style.display = "none";
    }
    TempoPopupIncrementOnClick = () => {
      this.tempo++;
      Constants.tempo++;
    }
    TempoPopupIncrementTenOnClick = () => {
      this.tempo += 10;
      Constants.tempo += 10;
    }
    TempoPopupDecrementOnClick = () => {
      this.tempo--;
      Constants.tempo--;
    }
    TempoPopupDecrementTenOnClick = () => {
      this.tempo -= 10;
      Constants.tempo -= 10;
    }
  
    TuningButtonOnMouseEnter = () => {
      let tuningPopup: HTMLElement = document.getElementById("tuning-popup");
      tuningPopup.style.display = "block";
      this.TempoPopupOnMouseLeave();
      this.TimeSigPopupOnMouseLeave();
    }
    TuningButtonOnMouseLeave = () => {
      let _this = this;
      setTimeout(function () {
        if (!_this.mouseOnTuningPopup) {
          let tuningPopup: HTMLElement = document.getElementById("tuning-popup");
          tuningPopup.style.display = "none";
        }
      }, 400);
    }
    TuningPopupOnMouseEnter = () => {
      this.mouseOnTuningPopup = true;
    }
    TuningPopupOnMouseLeave = () => {
      this.mouseOnTuningPopup = false;
      let tuningPopup: HTMLElement = document.getElementById("tuning-popup");
      tuningPopup.style.display = "none";
    }
    TuningOnChange = (e: any) => {
      let select = <HTMLSelectElement>e.currentTarget;
      this.tuning = parseInt(select.value);
      Constants.tuning = this.tuning;
    }
  
    TimeSigButtonOnMouseEnter = () => {
      let timesigPopup: HTMLElement = document.getElementById("timesig-popup");
      timesigPopup.style.display = "block";
      this.TempoPopupOnMouseLeave();
      this.TuningPopupOnMouseLeave();
    }
    TimeSigButtonOnMouseLeave = () => {
      let _this = this;
      setTimeout(function () {
        if (!_this.mouseOnTimeSigPopup) {
          let timesigPopup: HTMLElement = document.getElementById("timesig-popup");
          timesigPopup.style.display = "none";
        }
      }, 400);
    }
    TimeSigPopupOnMouseEnter = () => {
      this.mouseOnTimeSigPopup = true;
    }
    TimeSigPopupOnMouseLeave = () => {
      this.mouseOnTimeSigPopup = false;
      let timesigPopup: HTMLElement = document.getElementById("timesig-popup");
      timesigPopup.style.display = "none";
    }
    TimeSigOnClick = (i: number) => {
      if (this.TIME_SIGNATURES[i] != this.timeSig) {
        this.timeSig = this.TIME_SIGNATURES[i];
        Constants.timeSig = this.timeSig;
      }
    }
  
    CreatePopupBackgroundOnClick = () => {
      this.selection = -1;
      this.menuSetTemplates = this.allSetTemplates.filter(t => t.type == ChordType.Triad);
      this.combinedElements = undefined;
      window.removeEventListener("keypress", this.keyPressHandle);
    }
    CreatePopupCreateButtonOnClick = () => {
      let comp: any;
      window.removeEventListener("keypress", this.keyPressHandle);
      if (this.selection == 0) {
        let key: HTMLSelectElement = <HTMLSelectElement>document.getElementById("create-popup-note-combo-key");
        let octave: HTMLSelectElement = <HTMLSelectElement>document.getElementById("create-popup-note-combo-octave");
        let note = new Note(key.value, parseInt(octave.value));
        comp = Create.Note(note);
        this.allComponentsOnDesk.push(comp);
      }
      if (this.selection == 1) {
        let key: HTMLSelectElement = <HTMLSelectElement>document.getElementById("create-popup-chord-combo-key");
        let octave: HTMLSelectElement = <HTMLSelectElement>document.getElementById("create-popup-chord-combo-octave");
        let name: HTMLSelectElement = <HTMLSelectElement>document.getElementById("create-popup-chord-combo-name");
        let template = this.allSetTemplates.find(t => t.name == name.value);
        let chord = new Chord(key.value, parseInt(octave.value), template)
        comp = Create.Chord(chord);
        this.allComponentsOnDesk.push(comp);
        this.menuSetTemplates = this.allSetTemplates.filter(t => t.type == ChordType.Triad)
      }
      if (this.selection == 2) {
        //scale create
      }
      if (this.selection == 3) {
        let name: HTMLInputElement = <HTMLInputElement>document.getElementById("create-popup-customset-input");
        if (name.value == "") {
          let warningSpan = <HTMLElement>document.getElementById("create-popup-customset-span-large");
          warningSpan.style.color = "rgb(255, 0, 0)"
          let tickCount = 0;
          let interval = setInterval(function () {
            if (tickCount == 200) {
              warningSpan.style.color = "rgb(0, 0, 0)";
              clearInterval(interval);
            }
            else {
              let newRed = Math.floor(255 - tickCount * 255 / 200);
              warningSpan.style.color = "rgb(" + newRed.toString() + ", 0, 0)";
              tickCount++;
            }
          }, 10);
          window.addEventListener("keypress", this.keyPressHandle);
          return;
        }
        let customSet: CustomSet;
        customSet = new CustomSet(name.value);
        if (this.combinedElements) {
          let targetEl = this.combinedElements[0];
          let draggedEl = this.combinedElements[1];
          if (targetEl["componentType"] == ItemType.Note && draggedEl["componentType"] == ItemType.Note) {
            customSet.AddNote(targetEl["componentItem"]);
            customSet.AddNote(draggedEl["componentItem"]);
            comp = Create.CustomSet(customSet, targetEl.style.left, targetEl.style.top);
            this.allComponentsOnDesk.push(comp);
  
            let targetCompRef = this.allComponentsOnDesk.find(c => c.instance.element == targetEl);
            let targetIndex = this.allComponentsOnDesk.indexOf(targetCompRef);
            Remove.Note(targetCompRef);
            this.allComponentsOnDesk.splice(targetIndex, 1);
  
            let draggedCompRef = this.allComponentsOnDesk.find(c => c.instance.element == draggedEl);
            let draggedIndex = this.allComponentsOnDesk.indexOf(draggedCompRef)
            Remove.Note(draggedCompRef);
            this.allComponentsOnDesk.splice(draggedIndex, 1);
          }
        }
        else {
          comp = Create.CustomSet(customSet);
          this.allComponentsOnDesk.push(comp);
        }
      }
      comp.instance.itemOnDragStart.subscribe(el => this.ItemOnDragStart(el));
      comp.instance.itemOnDragEnter.subscribe(el => this.ItemOnDragEnter(el));
      comp.instance.itemOnDragLeave.subscribe(el => this.ItemOnDragLeave(el));
      comp.instance.itemOnDragEnd.subscribe(el => this.ItemOnDragEnd(el));
      comp.instance.itemOnDrop.subscribe(tuple => this.ItemOnDrop(tuple));
  
      this.selection = -1;
    }
    CreatePopupChordTypeOnChange = (e: Event) => {
      let type: HTMLSelectElement = <HTMLSelectElement>e.currentTarget;
      this.menuSetTemplates = this.allSetTemplates.filter(t => t.type.toString() == type.value);
    }
    CreatePopupCustomSetNameOnInput = (e: KeyboardEvent) => {
      let target = <HTMLInputElement>e.currentTarget;
      if (target.value.length > 8) {
        target.value = target.value.substring(0, 8);
        let warningSpan = <HTMLElement>document.getElementById("create-popup-customset-span-small");
        warningSpan.style.color = "rgb(255, 0, 0)"
        let tickCount = 0;
        let interval = setInterval(function () {
          if (tickCount == 200) {
            warningSpan.style.color = "rgb(0, 0, 0)";
            clearInterval(interval);
          }
          else {
            let newRed = Math.floor(255 - tickCount * 255 / 200);
            warningSpan.style.color = "rgb(" + newRed.toString() + ", 0, 0)";
            tickCount++;
          }
        }, 10);
      }
    }
  
    DeskOnDrop = (e: DragEvent) => {
      e.preventDefault();
      let divId = e.dataTransfer.getData('divId');
      let droppedItem = document.getElementById(divId);
      let currLeft = parseInt(droppedItem.style.left.substring(0, droppedItem.style.left.length - 2));
      let currTop = parseInt(droppedItem.style.top.substring(0, droppedItem.style.top.length - 2));
      let x = parseInt(e.dataTransfer.getData('x'));
      let y = parseInt(e.dataTransfer.getData('y'));
      if (currLeft + e.x - x < 0)
        droppedItem.style.left = '0px';
      else {
        if (currLeft + e.x - x + droppedItem.clientWidth > window.innerWidth)
          droppedItem.style.left = (window.innerWidth - droppedItem.clientWidth) + 'px';
        else
          droppedItem.style.left = (currLeft + e.x - x) + 'px';
      }
      if (currTop + e.y - y < 0)
        droppedItem.style.top = '0px';
      else {
        if (currTop + e.y - y + droppedItem.clientHeight > window.innerHeight * 0.92)
          droppedItem.style.top = (window.innerHeight * 0.92 - droppedItem.clientHeight) + 'px';
        else
          droppedItem.style.top = (currTop + e.y - y) + 'px';
      }
      droppedItem.style.opacity = "1";
    }
    DeskOnDragOver = (e: any) => {
      e.preventDefault();
    }
  
    ItemOnDragStart = (element: HTMLElement) => {
      this.draggedItem = element;
    }
    ItemOnDragEnter = (element: HTMLElement) => {
      if (element != this.draggedItem) {
        if (this.draggedItem["componentType"] == ItemType.Note) {
          this.draggedItem.style.cursor = "copy";
        }
        else if (element["componentType"] == ItemType.Note && this.draggedItem["componentType"] != ItemType.Note) {
          this.draggedItem.style.cursor = "no-drop";
        }
      }
    }
    ItemOnDragLeave = (element: HTMLElement) => {
      if (element != this.draggedItem) {
        this.draggedItem.style.cursor = "initial";
      }
    }
    ItemOnDragEnd = (element: HTMLElement) => {
      element.style.cursor = "pointer";
      this.draggedItem = undefined;
    }
    ItemOnDrop = (tuple: [HTMLElement, HTMLElement, number, number]) => {
      let targetEl = tuple[0];
      let draggedEl = tuple[1];
      let diffX = tuple[2];
      let diffY = tuple[3];
      if (targetEl == draggedEl) {
        let currLeft = parseInt(draggedEl.style.left.substring(0, draggedEl.style.left.length - 2));
        let currTop = parseInt(draggedEl.style.top.substring(0, draggedEl.style.top.length - 2));
        if (currLeft + diffX < 0)
          targetEl.style.left = '0px';
        else {
          if (currLeft + diffX + draggedEl.clientWidth > window.innerWidth)
            draggedEl.style.left = (window.innerWidth - draggedEl.clientWidth) + 'px';
          else
            draggedEl.style.left = (currLeft + diffX) + 'px';
        }
        if (currTop + diffY < 0)
          draggedEl.style.top = '0px';
        else {
          if (currTop + diffY + draggedEl.clientHeight > window.innerHeight * 0.92)
            draggedEl.style.top = (window.innerHeight * 0.92 - draggedEl.clientHeight) + 'px';
          else
            draggedEl.style.top = (currTop + diffY) + 'px';
        }
      }
      else {
        this.combinedElements = [targetEl, draggedEl];
        if (targetEl["componentType"] == ItemType.Note && draggedEl["componentType"] == ItemType.Note) {
          window.addEventListener("keypress", this.keyPressHandle);
          this.selection = 3;
        }
        else if (targetEl["componentType"] == ItemType["Custom Set"] && draggedEl["componentType"] == ItemType.Note) {
          let cstmSet = targetEl["componentItem"] as CustomSet;
          cstmSet.AddNote(draggedEl["componentItem"] as Note);
          let draggedCompRef = this.allComponentsOnDesk.find(c => c.instance.element == draggedEl);
          let draggedIndex = this.allComponentsOnDesk.indexOf(draggedCompRef)
          Remove.Note(draggedCompRef);
          this.allComponentsOnDesk.splice(draggedIndex, 1);
        }
      }
  
      draggedEl.style.opacity = "1";
    }
  }