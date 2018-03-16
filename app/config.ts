export interface IConfig {
  port: number;
}

// @todo replace with configurable data, test data now
export const config: IConfig = {
  port: parseInt(process.env.NODE_PORT, 10) || 3000,
};
