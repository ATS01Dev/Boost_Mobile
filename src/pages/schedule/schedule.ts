import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media';
import { Component, ViewChild } from '@angular/core';

import { AlertController, App, FabContainer, ItemSliding, List, ModalController, NavController, ToastController, LoadingController, Refresher } from 'ionic-angular';

// import moment from 'moment';

import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';

import { SessionDetailPage } from '../session-detail/session-detail';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';


@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html'
})
export class SchedulePage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('scheduleList', { read: List }) scheduleList: List;

  dayIndex = 0;
  queryText = '';
  segment = 'all';
  excludeTracks: any = [];
  shownSessions: any = [];
  groups: any = [];
  confDate: string;
  playList : any = []; ;
  play :any;
  showModePay= false;
  videoUrl: SafeResourceUrl;
  modeP:any;

  constructor(
    public alertCtrl: AlertController,
    public app: App,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public confData: ConferenceData,
    public user: UserData,
    private stremingMedia: StreamingMedia,
    private domSanitizer: DomSanitizer
  ) {
    this.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/aw5pMBeOWM0')

  this.playList =[
    { id :"",
      title :"Gérez vos codes avec Git",
      description : "Ces outils suivent l’évolution de vos fichiers <br> source et gardent les anciennes versions de chacun d’eux.",
      urlVideo: "https://www.youtube.com/embed/_UM3I4lY448",
      types :"1000 F",
      urlImg: 'assets/img/crs1.png'
    },
    { id :"",
      title :"Cours informatique débutant",
      description : "Cours informatique débutant - Partie 2 - Le menu demarrer ",
      urlVideo: "https://www.youtube.com/embed/qOnyzImxBDw",
      types :"Gratuit",
      urlImg: 'assets/img/nin-live.png'
    },
    { id :"Cours informatique débutant",
      title :"Qu'est ce que le language JAVA",
      description : "",
      urlVideo: "https://www.youtube.com/embed/zZv1wi9RRoU",
      types :"1000 F",
      urlImg: ''
    }
  ]
/*
 this.play : playCoursVideos[] =[{
  title :"",
  description :"",
  urlVideo :""
  }
  ]; */

  }
  getPlayList(){
    this.confData.getVideo().subscribe(
      (data :any) => {
        data = this.play;
        console.log(`play list ${this.play} dada ${data} `)
      }
    )
  }

  ionViewDidLoad() {
    this.app.setTitle('Boost');
    this.updateSchedule();
    this.getPlayList();
  }
  type(typecrs: any ): boolean{
    if(typecrs == 'Gratuit'){
      return true
    }
    return false;
  }
  showTextButon(typecrs: any ): string{
    if(typecrs == 'Gratuit'){
      return 'Voir'
    } else
    return 'Payer';
  }
  showModePays(){
    this.showModePay= true;
  }
  presentPrompt(mode: any) {
    let alert = this.alertCtrl.create({
      title: `${mode} `,
      inputs: [
        {
          name: 'Numéro de télephone',
          placeholder: 'Numéro de télephone'
        },
        {
          name: 'Mode de Passe',
          placeholder: 'Mode de Passe',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked' +data);
          }
        },
        {
          text: 'Valider',
          handler: data => {
            /* if (data.username != null ||  data.password != null) {

            } else {
              // invalid logi
              return false;
            } */
            console.log(`numero ${data.username} mot de passe ${data.password} `)
          }
        }
      ]
    });
    alert.present();
  }
  ionSelectChange(){
    this.presentPrompt(this.modeP);

  }
  updateSchedule() {
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();

    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).subscribe((data: any) => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;
    });
  }

  presentFilter() {
    let modal = this.modalCtrl.create(ScheduleFilterPage, this.excludeTracks);
    modal.present();

    modal.onWillDismiss((data: any[]) => {
      if (data) {
        this.excludeTracks = data;
        this.updateSchedule();
      }
    });

  }

  goToSessionDetail(sessionData: any) {
    // go to the session detail page
    // and pass in the session data

    this.navCtrl.push(SessionDetailPage, { sessionId: sessionData.id, name: sessionData.name });
  }

  addFavorite(slidingItem: ItemSliding, sessionData: any) {

    if (this.user.hasFavorite(sessionData.name)) {
      // woops, they already favorited it! What shall we do!?
      // prompt them to remove it
      this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
    } else {
      // remember this session as a user favorite
      this.user.addFavorite(sessionData.name);

      // create an alert instance
      let alert = this.alertCtrl.create({
        title: 'Favorite Added',
        buttons: [{
          text: 'OK',
          handler: () => {
            // close the sliding item
            slidingItem.close();
          }
        }]
      });
      // now present the alert on top of all other content
      alert.present();
    }

  }

  removeFavorite(slidingItem: ItemSliding, sessionData: any, title: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: 'Would you like to remove this session from your favorites?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        },
        {
          text: 'Remove',
          handler: () => {
            // they want to remove this session from their favorites
            this.user.removeFavorite(sessionData.name);
            this.updateSchedule();

            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        }
      ]
    });
    // now present the alert on top of all other content
    alert.present();
  }

  openSocial(network: string, fab: FabContainer) {
    let loading = this.loadingCtrl.create({
      content: `Posting to ${network}`,
      duration: (Math.random() * 1000) + 500
    });
    loading.onWillDismiss(() => {
      fab.close();
    });
    loading.present();
  }

  doRefresh(refresher: Refresher) {
    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).subscribe((data: any) => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;

      // simulate a network request that would take longer
      // than just pulling from out local json file
      setTimeout(() => {
        refresher.complete();

        const toast = this.toastCtrl.create({
          message: 'Sessions have been updated.',
          duration: 3000
        });
        toast.present();
      }, 1000);
    });
  }
// custome jouer la video
  PlayVideo(){
    let option: StreamingVideoOptions = {
      successCallback: () => {console.log("start ")},
      errorCallback:() => {console.log("error")},
      orientation: 'portrait'
      }
      this.stremingMedia.playVideo("http://localhost:8090/video/fish3.mp4",option);
    }

  }

