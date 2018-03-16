export interface IConfig {
  port: number;
  mail: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    }
  };
}

// @todo replace with configurable data, test data now
export const config: IConfig = {
  port: parseInt(process.env.NODE_PORT, 10) || 3000,
  mail: {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'zkjrr2aqikh6mima@ethereal.email',
      pass: 'XB8pwrehpvNhs88Smz',
    }
  }
};
