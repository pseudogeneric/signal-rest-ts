interface Identity {
  added?: string;
  fingerprint?: string;
  number?: string;
  safety_number?: string;
  status?: string;
  uuid?: string;
}

type Identities = Identity[];

export { Identity, Identities };
