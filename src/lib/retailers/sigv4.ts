import crypto from 'crypto';

export interface SigV4Params {
  method: string;
  host: string;
  region: string;
  service: string;
  path: string;
  payload: string;
  target: string;
  accessKey: string;
  secretKey: string;
  date?: Date;
}

export interface SignedHeadersResult {
  headers: Record<string, string>;
  authorizationHeader: string;
}

function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

/**
 * Derives the AWS SigV4 signing key.
 */
function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = hmacSha256('AWS4' + key, dateStamp);
  const kRegion = hmacSha256(kDate, regionName);
  const kService = hmacSha256(kRegion, serviceName);
  const kSigning = hmacSha256(kService, 'aws4_request');
  return kSigning;
}

/**
 * Signs an Amazon PA-API 5.0 HTTP request using AWS Signature Version 4.
 */
export function signAmazonPaapi5(params: SigV4Params): SignedHeadersResult {
  const now = params.date || new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.substring(0, 8); // YYYYMMDD

  const canonicalUri = params.path || '/paapi5/searchitems';
  const canonicalQueryString = '';
  const payloadHash = sha256Hex(params.payload);

  const headers: Record<string, string> = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    'host': params.host,
    'x-amz-date': amzDate,
    'x-amz-target': params.target,
  };

  const canonicalHeaders =
    `content-encoding:${headers['content-encoding']}\n` +
    `content-type:${headers['content-type']}\n` +
    `host:${headers['host']}\n` +
    `x-amz-date:${headers['x-amz-date']}\n` +
    `x-amz-target:${headers['x-amz-target']}\n`;

  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest =
    `${params.method}\n` +
    `${canonicalUri}\n` +
    `${canonicalQueryString}\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${params.region}/${params.service}/aws4_request`;
  const stringToSign =
    `${algorithm}\n` +
    `${amzDate}\n` +
    `${credentialScope}\n` +
    `${sha256Hex(canonicalRequest)}`;

  const signingKey = getSignatureKey(params.secretKey, dateStamp, params.region, params.service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

  const authorizationHeader =
    `${algorithm} ` +
    `Credential=${params.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;

  return {
    headers: {
      ...headers,
      'Authorization': authorizationHeader,
    },
    authorizationHeader,
  };
}
