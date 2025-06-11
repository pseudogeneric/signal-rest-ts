type AboutCapabilitiesInfo = Map<string, string[]>;

interface AboutInfo {
  build?: number;
  capabilities?: AboutCapabilitiesInfo;
  mode?: string;
  version?: string;
  versions?: string[];
}

export { AboutCapabilitiesInfo, AboutInfo };
