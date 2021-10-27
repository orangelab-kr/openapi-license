import cheerio from 'cheerio';
import dayjs from 'dayjs';
import got from 'got';
import { logger, Webhook } from '..';
import { randomBytes } from 'crypto';

export class License {
  public static async isValidLicense(props: {
    realname: string;
    birthday: Date;
    license: [string, string, string, string];
    identity?: string;
  }): Promise<boolean> {
    if (this.isBypassLicense(props)) return true;
    const birthday = dayjs(props.birthday);
    const randomKey = randomBytes(3).toString('hex').toUpperCase();
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
        btnSearch_msg0_new: randomKey,
        Security_Mag: randomKey,
        licenNo0: props.license[0],
        licenNo1: props.license[1],
        licenNo2: props.license[2],
        licenNo3: props.license[3],
        ghostNo: props.identity,
      },
    }).text();

    const $ = cheerio.load(res);
    const result = $('#licen-truth > tbody > tr:nth-child(1) > td').text();
    const isSuccess = result
      .trim()
      .replace(/\s{2}/g, '')
      .startsWith('전산 자료와 일치 합니다.');
    const message = isSuccess
      ? '✔️ 라이선스가 인증되었습니다.'
      : '❌ 라이선스 인증이 시도되었습니다.';

    await Webhook.send(
      `${message}
        
· 성명: ${props.realname}
· 라이선스: ${props.license.join('-')}
· 생년월일: ${birthday.format('YYYY-MM-DD')}`
    );

    return isSuccess;
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

      Webhook.send(
        `😎 바이패스용 라이선스가 사용되었습니다.
        
· 성명: ${realname}
· 라이선스: ${bypassLicense}
· 생년월일: ${birthday}`
      );

      return true;
    }

    return false;
  }
}
