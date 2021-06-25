import cheerio from 'cheerio';
import dayjs from 'dayjs';
import got from 'got';
import { logger } from '../tools';

export class License {
  public static async isValidLicense(props: {
    realname: string;
    birthday: Date;
    license: [string, string, string, string];
    identity?: string;
  }): Promise<boolean> {
    if (this.isBypassLicense(props)) return true;
    const birthday = dayjs(props.birthday);
    const res = await got({
      method: 'POST',
      url: 'https://www.efine.go.kr/licen/truth/licenTruth.do',
      searchParams: { subMenuLv: '010100' },
      form: {
        checkPage: 2,
        flag: 'searchPage',
        regYear: birthday.year(),
        regMonth: birthday.month() + 1,
        regDate: birthday.date(),
        name: props.realname,
        licenNo0: props.license[0],
        licenNo1: props.license[1],
        licenNo2: props.license[2],
        licenNo3: props.license[3],
        ghostNo: props.identity,
      },
    }).text();

    const $ = cheerio.load(res);
    const result = $('#licen-truth > tbody > tr:nth-child(1) > td').text();
    return result
      .trim()
      .replace(/\s{2}/g, '')
      .startsWith('전산 자료와 일치 합니다.');
  }

  public static isBypassLicense(props: {
    realname: string;
    birthday: Date;
    license: [string, string, string, string];
  }): boolean {
    const { realname, license } = props;
    const licenseStr = license.join('-');
    const bypassStr = String(process.env.LICENSE_BYPASS || '');
    const bypassLicenses = bypassStr.split(',');
    for (const bypassLicense of bypassLicenses) {
      if (licenseStr !== bypassLicense) continue;
      const birthday = dayjs(props.birthday).format('YYYY-MM-DD');
      logger.warn(
        `${realname}님께서 바이패스용 라이선스를 사용하였습니다. (${bypassLicense}, ${birthday})`
      );

      return true;
    }

    return false;
  }
}
