export type RootStackParamList = {
  Loader: undefined;
  Onboard: undefined;
  Home: undefined;

  StartGame: undefined;
  FrozenTrial: undefined;
  IceExchange: undefined;
  Collection: undefined;

  FrozenTrialLevel: { levelId: number };
  FrozenTrialDefeat: { levelId: number; questionIndex: number };
  FrozenTrialVictory: { levelId: number };
};
