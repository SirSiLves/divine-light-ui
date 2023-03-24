import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { AiDqnService } from './ai-dqn.service';
import { GodType } from '../../../state/player/player.model';

@Injectable({
  providedIn: 'root'
})
export class AiTensorflowService {

  public tf = tf;

  constructor() {
  }


  createBitmapDQNModel(): any {
    // define and get network-model
    const model = this.tf.sequential();

    model.add(
      tf.layers.inputLayer({
        inputShape: [AiDqnService.ALL_DQN_SETTINGS.NUM_BOARD_HEIGHT, AiDqnService.ALL_DQN_SETTINGS.NUM_BOARD_WIDTH, 24] // h, w, depth (channel)
      })
    );

    model.add(tf.layers.flatten());

    model.add(
      tf.layers.dense({
        units: AiDqnService.ALL_DQN_SETTINGS.neuronsHiddenBitmap,
        activation: 'relu',
      })
    );

    model.add(
      tf.layers.dense({
        units: AiDqnService.ALL_DQN_SETTINGS.neuronsHiddenBitmap,
        activation: 'relu',
      })
    );

    model.add(
      tf.layers.dense({
        units: AiDqnService.ALL_DQN_SETTINGS.NUM_MOVES, // num of possible actions upper bound,
        activation: 'linear',
        kernelInitializer: tf.initializers.zeros()
      })
    );

    return model;
  }

  compileDQNNetworks(model: any): void {
    model.compile({
      optimizer: tf.train.adam(AiDqnService.ALL_DQN_SETTINGS.alpha),
      loss: tf.losses.meanSquaredError
    });
  }

  loadModel(model: File, weights: File): Promise<any> {
    return tf.loadLayersModel(tf.io.browserFiles([model, weights]));
  }

  prepare(): void {
    // Memory leak https://stackoverflow.com/questions/56513495/memory-leak-in-tensorflow-js-how-to-clean-up-unused-tensors
    this.tf.engine().startScope();
  }

  cleanUp(): void {
    // Memory leak https://stackoverflow.com/questions/56513495/memory-leak-in-tensorflow-js-how-to-clean-up-unused-tensors
    this.tf.engine().endScope();
  }


  predictBitmap(model: any, state: number[][]): number[] {
    const boardLayers: number[][][] = AiTensorflowService.getBitmap(state);
    const reshapedTensor = tf.transpose(tf.tensor4d([
      boardLayers, // only one sample
    ]), [0, 2, 3, 1]);

    return model.predict(reshapedTensor).dataSync();
  }

  predictBitmapWithBatch(model: any, stateList: number[][][][]): number[][] {
    const reshapedTensor = tf.transpose(tf.tensor4d(stateList), [0, 2, 3, 1]);
    return model.predict(reshapedTensor).arraySync();
  }

  static getBitmap(matrix: number[][]): number[][][] {
    // layers (2 * 5 * 4) -> some layers can be discarded on impossible rotations (wall / king) -> 24 layers (channels)
    // player (2), piece type (5), rotation (4)
    let layer: number[][][] = [];

    // layer #1 1
    layer.push(this.getSingleBoardLayer(matrix, 1));
    // layer #2 11
    layer.push(this.getSingleBoardLayer(matrix, 11));
    // layer #3 21
    layer.push(this.getSingleBoardLayer(matrix, 21));
    // layer #4 31
    layer.push(this.getSingleBoardLayer(matrix, 31));
    // layer #5 101
    layer.push(this.getSingleBoardLayer(matrix, 101));
    // layer #6 111
    layer.push(this.getSingleBoardLayer(matrix, 111));
    // layer #7 121
    layer.push(this.getSingleBoardLayer(matrix, 121));
    // layer #8 131
    layer.push(this.getSingleBoardLayer(matrix, 131));
    // layer #9 2
    layer.push(this.getSingleBoardLayer(matrix, 2));
    // layer #10 102
    layer.push(this.getSingleBoardLayer(matrix, 102));
    // layer #11 3
    layer.push(this.getSingleBoardLayer(matrix, 3));
    // layer #12 103
    layer.push(this.getSingleBoardLayer(matrix, 103));
    // layer #13 4
    layer.push(this.getSingleBoardLayer(matrix, 4));
    // layer #14 14
    layer.push(this.getSingleBoardLayer(matrix, 14));
    // layer #15 104
    layer.push(this.getSingleBoardLayer(matrix, 104));
    // layer #16 114
    layer.push(this.getSingleBoardLayer(matrix, 114));
    // layer #17 5
    layer.push(this.getSingleBoardLayer(matrix, 5));
    // layer #18 15
    layer.push(this.getSingleBoardLayer(matrix, 15));
    // layer #19 25
    layer.push(this.getSingleBoardLayer(matrix, 25));
    // layer #20 35
    layer.push(this.getSingleBoardLayer(matrix, 35));
    // layer #21 105
    layer.push(this.getSingleBoardLayer(matrix, 105));
    // layer #22 115
    layer.push(this.getSingleBoardLayer(matrix, 115));
    // layer #23 125
    layer.push(this.getSingleBoardLayer(matrix, 125));
    // layer #24 135
    layer.push(this.getSingleBoardLayer(matrix, 135));

    return layer;
  }


  private static getSingleBoardLayer(matrix: number[][], piece: number): number[][] {
    const pieceBoard: number[][] = [];

    for (let y = 0; y < matrix.length; y++) {
      pieceBoard.push([]);

      for (let x = 0; x < matrix[y].length; x++) {
        let entry: number = matrix[y][x];
        if (entry === piece) pieceBoard[y].push(1);
        else pieceBoard[y].push(0);
      }
    }

    return pieceBoard;
  }

  public fitQValuesWithDatasetBitmap(model: any, stateListSamples: number[][][][], actionNewQValuesSamples: number[][], isTraining: GodType): Promise<any> {
    const reshapedStateTensor = tf.transpose(tf.tensor4d(stateListSamples), [0, 2, 3, 1]);
    const tensorTargetActionQValues = tf.tensor2d(actionNewQValuesSamples);

    return model.fit(reshapedStateTensor, tensorTargetActionQValues, {
      epochs: AiDqnService.ALL_DQN_SETTINGS.epochs,
      batchSize: AiDqnService.ALL_DQN_SETTINGS.batchSize
    });
  }

}
