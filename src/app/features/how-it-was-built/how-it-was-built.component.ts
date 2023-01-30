import { Component } from '@angular/core';

@Component({
  selector: 'app-how-it-was-built',
  templateUrl: './how-it-was-built.component.html',
  styleUrls: ['./how-it-was-built.component.scss']
})
export class HowItWasBuiltComponent {

  klassendiagramm = [
    {
      name: 'GameManager',
      beschreibung: 'Über den GameManger wird das Spielgestartet. Ebenfalls kann hier der DebugMode aktiviert/deaktiviert werden.'
    },
    {
      name: 'Matrix',
      beschreibung: 'In der Matrix ist der ganze Spielstand gespeichert. Anhand der Matrix wird dann das Spielbrett dargestellt.'
    },
    {
      name: 'Executor',
      beschreibung: 'Der Executor ist der Client, welcher die einzelnen Commands ausführt und auch historisiert.'
    },
    {
      name: 'ICommand',
      beschreibung: 'Interface fürs Command Pattern.'
    },
    {
      name: 'InitializeCommand',
      beschreibung: 'Initialisierung Command fürs erstellen der Matrix.'
    },
    {
      name: 'MoveCommand',
      beschreibung: 'Einzelzug Command.'
    },
    {
      name: 'RotationCommand',
      beschreibung: 'Rotation Command.'
    },
    {
      name: 'SwapCommand',
      beschreibung: 'Figuren Tausch Command.'
    },
    {
      name: 'DestroyCommand',
      beschreibung: 'Zerstören Command.'
    },
    {
      name: 'BoardFactory',
      beschreibung: 'Hier ist die Steuerung von der CellFactory & PieceFactory fürs erstellen des Spielbretts.'
    },
    {
      name: 'CellFactory',
      beschreibung: 'Hier werden die einzelnen Spielfelder generiert.'
    },
    {
      name: 'PieceFactory',
      beschreibung: 'Hier ist die Startaufstellung hinterlegt. Daraus werden dann die Figuren instanziiert.'
    },
    {
      name: 'Cell',
      beschreibung: 'Einzelnes Feld.'
    },
    {
      name: 'Piece',
      beschreibung: 'Einzelne Spielfigur.'
    },
    {
      name: 'ClickHandler',
      beschreibung: 'Im ClickHandler werden die Klicks von der Maustaste validiert und anschliessend en Zug ausgelöst.'
    },
    {
      name: 'PieceHandler',
      beschreibung: 'Im PieceHandler werden die Events fürs bewegen/zerstören einer Spielfigur ausgelöst.'
    },
    {
      name: 'PlayerHandler',
      beschreibung: 'Der PlayerHandler wechselt zwischen den Spielern und handelt das Licht.'
    },
    {
      name: 'CellHandler',
      beschreibung: 'Hier werden die Events fürs anzeigen der Spielfeldfarben ausgelöst. '
    },
    {
      name: 'BotHandler',
      beschreibung: 'Aus dem BotHandler wird die Schwierigkeit Stufe ausgelesen und zur Berechnung des nächsten Zuges ' +
        'an die BotValidator übergeben. Ist die Berechnung abgeschlossen, wird hier der AI Spielzug ausgeführt.'
    },
    {
      name: 'LightHandler',
      beschreibung: 'Im LightHandler ist die Validierung und Weiterleitung des LineRenderes (Licht Gottes) zwischen den ' +
        'GameObjects definiert. '
    },
    {
      name: 'BotValidatorMCTS',
      beschreibung: 'Hier wird der MonteCarloTreeSearch-Algorithmus ausgeführt.'
    },
    {
      name: 'BotValidatorMiniMax',
      beschreibung: 'Hier wird der MiniMax-Algorithmus ausgeführt.'
    },
    {
      name: 'BotValidatorMixed',
      beschreibung: 'In dieser Klasse werden die beiden Algorithmen MCTS & MiniMax kombiniert.'
    },
    {
      name: 'BotValidatorRND',
      beschreibung: ' Auf der kleinsten Schwierigkeit Stufe wird mittels BotValidatorRND ein Zufallszug generiert.'
    },
    {
      name: 'Tree',
      beschreibung: 'Der Tree hält den ROOT-Node fürs berechnen des MCTS/Minimax.'
    },
    {
      name: 'Node',
      beschreibung: 'Im Node sind die Resultate der Berechnung, sowie weitere Child Nodes enthalten.'
    },
    {
      name: 'Branch',
      beschreibung: 'Ein Branch hält einen einzelnen Spielstand bzw. Spielzug.'
    }

  ];

  constructor() {
  }

}
