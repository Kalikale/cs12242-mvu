import { Effect } from "effect"

export type Cmd<Msg> = {
  sub: (dispatch: (msg: Msg) => void) => Effect.Effect<void, any, never>
} | null

export namespace Cmd {
  export const ofSub = <Msg>(
    sub: (dispatch: (msg: Msg) => void) => Effect.Effect<void, any, never>,
  ): Cmd<Msg> => ({
    sub,
  })
}

export type ModelCmd<Model, Msg> = {
  model: Model
  cmd: Cmd<Msg>
}
