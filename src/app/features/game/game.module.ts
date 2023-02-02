import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { BoardComponent } from './board/board.component';
import { LightComponent } from './light/light.component';
import { CellComponent } from './board/cell/cell.component';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { HistoryComponent } from './history/history.component';
import { PgnLoaderComponent } from './settings/pgn-loader/pgn-loader.component';
import { GodPlayingComponent } from './settings/god-playing/god-playing.component';
import { PieceComponent } from './board/piece/piece.component';
import { SettingsComponent } from './settings/settings.component';
import { ModeComponent } from './settings/mode/mode.component';
import { CheckboxModule } from 'primeng/checkbox';
import { WinnerComponent } from './playing/winner/winner.component';
import { ResultComponent } from './playing/result/result.component';
import { DragDropModule } from 'primeng/dragdrop';
import { BotLevelComponent } from './settings/bot-level/bot-level.component';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { TabViewModule } from 'primeng/tabview';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { SimulationComponent } from './settings/simulation/simulation.component';
import { DrawComponent } from './playing/draw/draw.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { PollComponent } from './poll/poll.component';
import { SharedModule } from '../../shared/shared.module';
import { GameRoutingModule } from './game-routing.module';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    GameComponent,
    BoardComponent,
    LightComponent,
    CellComponent,
    WinnerComponent,
    ResultComponent,
    PgnLoaderComponent,
    HistoryComponent,
    PieceComponent,
    GodPlayingComponent,
    SettingsComponent,
    ModeComponent,
    BotLevelComponent,
    SimulationComponent,
    DrawComponent,
    PollComponent,
  ],
  exports: [
    ResultComponent,
    HistoryComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    InputSwitchModule,
    ReactiveFormsModule,
    CardModule,
    SelectButtonModule,
    DropdownModule,
    DialogModule,
    FormsModule,
    TooltipModule,
    CheckboxModule,
    DragDropModule,
    TriStateCheckboxModule,
    TabViewModule,
    InputNumberModule,
    FileUploadModule,
    ClipboardModule,
    SharedModule,
    TranslateModule,
    RippleModule,
    InputTextModule
  ]
})
export class GameModule {
}
