import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { AiDqnService } from './ai-dqn.service';

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
}
