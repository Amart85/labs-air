import { Component, Input, ElementRef, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

// GeoAnalytics
//import { T } from '../../../GeoAnalytics';
declare var T: any;

export class LegendItem {
  color: any;
  value: number;
}

@Component({
  selector: 'app-maporama',
  templateUrl: './maporama.component.html',
  styleUrls: ['./maporama.component.css']
})
export class MaporamaComponent implements OnInit, OnChanges {

  @ViewChild('chart', { static: false }) public chartEl: ElementRef;
  @ViewChild('maplegend', { static: false }) public legendEl: ElementRef;
  @Input() mapConfig: any;
  private maporamaMap: any;
  private legendcolors: LegendItem[];
  public geoname: any;
  public geovalue: any;
  public showLegend: boolean;
  private instvectorlayer: any;

  constructor(private router: Router) { 

  }

  ngOnInit() {

    // Initialize ui variables
    this.geoname = "";
    this.geovalue = "";
    this.showLegend = false;

    this.setMap();

  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "mapConfig" changed
    if (changes['mapConfig']) {
      this.setMap();
    }
  }

  setMap() {

    console.log("Setting the map");
    if (this.mapConfig != null) {
      console.log("mapConfig: ", this.mapConfig);

      if (this.chartEl && this.chartEl.nativeElement) {

        // Create maporama map centered at lat/lon and at a specific zoom
        var map = new T.Map(
          this.chartEl.nativeElement,
          {
            zoom: this.mapConfig.zoom,
            center: new T.LatLng(this.mapConfig.centerLat,
              this.mapConfig.centerLon)
          }
        );

        // Add Tibco Layer
        var tibcoLayerStandard = new T.TibcoLayer({ name: "TibcoLayer 1" });
        map.addLayer(tibcoLayerStandard);

        // Add popup and marker layers
        var popupsLayer = new T.PopupsLayer();
        var markersLayer = new T.MarkersLayer();
        map.addLayer(popupsLayer);
        map.addLayer(markersLayer);

        //Create popup
        var popup = new T.Popup("", {
          closeButtonUrl: "https://geoanalytics.tibco.com/documentation/assets/img/close.png",
          offset: {
            x: 0,
            y: -35
          },
          panMap: true,
          panMapExtraOffset: {
            x: 0,
            y: 10
          }
        });
        popupsLayer.addPopup(popup);

        // Add markers
        let seriesData = this.mapConfig.data;
        for (let i in seriesData) {

          var item = seriesData[i];
          var marker = new T.ImageMarker(new T.LatLng(item.lat, item.lon),
            "https://geoanalytics.tibco.com/documentation/assets/img/marker.png", {
            name: item.label,
            id: item.uuid
          });

          markersLayer.addMarker(marker);

          //Add events
          // markersLayer.events.on("press", function(marker) {
          //
          //   popup.setHtml("<div class='popup'>{{title}}</div>", {
          //   title: marker.options.name
          //   });
          //
          //   popup.open(marker.latlng);
          // });

          markersLayer.events.on("over", this.hooverOverMarker.bind(this));
          markersLayer.events.on("out", this.hooverOutMarker.bind(this));
          markersLayer.events.on("press", this.mousePressMarker.bind(this));
          markersLayer.events.on("long-press", this.mousePressMarker.bind(this));

        };

        //Add the navigation control
        var navigationControl = new T.NavigationControl({
          offset: [10, 10],
          panControl: true,
          zoomControl: true,
          zoomRailHeight: 120,
          titles: {
            panUp: "Pan up",
            panDown: "Pan down",
            panLeft: "Pan left",
            panRight: "Pan right",
            reset: "Reset map",
            zoomIn: "Zoom in",
            zoomOut: "Zoom out"
          }
        });
        map.addControl(navigationControl);


        this.maporamaMap = map;

      }

    }

  }

  mousePress(obj) {
    console.log("mousePress: ", obj);

    var data = obj.options.geojsonProperties;

    this.mapDrilldown(data);
    //console.log("Geo Name: " + data.name);
  }

  hooverOver(obj) {
    console.log("hooverOvber: ", obj);

    var data = obj.options.geojsonProperties;

    obj.setStyle({ weight: 5, color: '#666', dashArray: '' });

    this.instvectorlayer.bringToFront(obj);

    this.geoname = data.name;
    this.geovalue = data.value;
  }


  hooverOut(obj) {
    console.log("hooverOut: ", obj);

    var data = obj.options.geojsonProperties;

    obj.setStyle(this.styleMap(data));

    this.geoname = "N/A";
    this.geovalue = 0;
  }


  hooverOverMarker(obj) {
    console.log("hooverOverMarker: ", obj);

    this.geoname = obj.options.name;
    this.geovalue = "";
  }

  hooverOutMarker(obj) {
    console.log("hooverOutMarker: ", obj);

    this.geoname = "";
    this.geovalue = "";
  }

  mousePressMarker(obj) {
    console.log("mousePressMarker: ", obj);

    this.mapMarkerDrilldown(obj.options.id, obj.options.name);

  }

  mapDrilldown(e) {


  }

  mapMarkerDrilldown(uuid, label) {
    console.log("In mapMarkerDrilldown for: ", uuid, label);
    
    this.router.navigate(['/starterApp/home/gatewaydashboard']);
  }

  styleMap(properties) {

    function getHexColorIn(colors, value) {
      return value >= colors[7].value ? '#800026' :
        value >= colors[6].value ? '#BD0026' :
          value >= colors[5].value ? '#E31A1C' :
            value >= colors[4].value ? '#FC4E2A' :
              value >= colors[3].value ? '#FD8D3C' :
                value >= colors[2].value ? '#FEB24C' :
                  value >= colors[1].value ? '#FED976' :
                    '#FFEDA0';
    }

    // console.log("LegendColors");
    // console.log("LegendColors[0]: " + this.legendcolors[0].value);
    // console.log("LegendColors[7]: " + this.legendcolors[7].value);

    return {
      color: '#fff',
      opacity: 1,
      weight: 1,
      fillOpacity: 0.8,
      dashArray: 0,
      fillColor: properties ? getHexColorIn(this.legendcolors, properties.value) : '#fff7f3'
    };
  }
}
