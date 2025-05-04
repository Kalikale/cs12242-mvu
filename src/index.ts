import { Cmd, type ModelCmd } from "./cmd"
import { Effect } from "effect"
import {
  h,
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  attributesModule,
  type VNode,
} from "snabbdom"

const patch = init([
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  attributesModule,
])

export const startSimple = <Model, Msg>(
  root: HTMLElement,
  initModel: Model,
  update: (msg: Msg, model: Model) => Model,
  view: (model: Model, dispatch: (msg: Msg) => void) => VNode,
) => {
  const main = Effect.gen(function* () {
    const messageQueue: Msg[] = []

    const updateModel = () => {
      while (messageQueue.length > 0) {
        const msg = messageQueue.splice(0, 1)[0]

        let newModel = update(msg, model)

        model = newModel
      }

      container = patch(container, view(model, dispatch))
    }

    const dispatch = (msg: Msg) => {
      messageQueue.push(msg)
      setTimeout(updateModel, 0)
    }

    let model = initModel
    let container = patch(root, view(model, dispatch))
  })

  Effect.runPromise(main)
}

export const startModelCmd = <Model, Msg>(
  root: HTMLElement,
  initModel: ModelCmd<Model, Msg>,
  update: (msg: Msg, model: Model) => ModelCmd<Model, Msg>,
  view: (model: Model, dispatch: (msg: Msg) => void) => VNode,
) => {
  const main = Effect.gen(function* () {
    const messageQueue: Msg[] = []

    const updateModel = () => {
      while (messageQueue.length > 0) {
        const msg = messageQueue.splice(0, 1)[0]

        let { model: newModel, cmd } = update(msg, model)

        model = newModel

        if (cmd !== null) {
          Effect.runFork(
            cmd.sub(dispatch).pipe(Effect.tap(() => updateModel())),
          )
        }
      }

      container = patch(container, view(model, dispatch))
    }

    const dispatch = (msg: Msg) => {
      messageQueue.push(msg)
      setTimeout(updateModel, 0)
    }

    let { model, cmd: initCmd } = initModel
    if (initCmd) {
      Effect.runFork(
        initCmd.sub(dispatch).pipe(Effect.tap(() => updateModel())),
      )
    }

    let container = patch(root, view(model, dispatch))
  })

  Effect.runPromise(main)
}

export { h, Cmd, type ModelCmd }
