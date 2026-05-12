export interface GeneratedCommand {
  argv: string[];
  oneLiner: string;
  multiLine: string;
  shellScript: string;
  warnings: string[];
  hints: string[];
  errors: string[];
}
