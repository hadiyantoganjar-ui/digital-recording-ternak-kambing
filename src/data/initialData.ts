import { GoatRecord, UmurKategori, JenisKelamin, StatusKesehatanUtama, RiwayatBobot, CatatanPakanHarian } from '../types';

// Raw CSV data parsed from field recording
const rawCsvData = `
112025180600004,0004,Betina,I0,PE,,Sehat,Purwanto,Sukamaju,03/12/2025 14:15:29,,
112025180600005,0005,Betina,I2,PE,,Sehat,Purwanto,Sukamaju,03/12/2025 14:17:58,,
112025180600001,0001,Jantan,I0,PE,,Sehat,Purwanto,Sukamaju,03/12/2025 14:18:23,,
112025180600006,0006,Jantan,I0,Boer,,,Purwanto,Sukamaju,03/12/2025 14:19:29,,
112025180600011,0011,Betina,I0,Boer,,Sehat,Purwanto,Sukamaju,03/12/2025 14:20:42,,
112025180600015,0015,Betina,I3,Boer,,Sehat,Purwanto,Sukamaju,03/12/2025 14:22:01,,
112025180600100,0100,Jantan,I3,PE,,Sehat,Purnomo,Sukamaju,03/12/2025 14:23:34,,
112025180600020,0020,Jantan,I0,PE,,Sehat,Purwanto,Sukamaju,03/12/2025 14:24:19,,
112025180600033,0033,Betina,I2,PE,,Sehat,Purwanto,Sukamaju,03/12/2025 14:25:03,,
112025180600022,0022,Betina,I2,PE,,Sehat,Purnomo,Sukamaju,03/12/2025 14:26:12,,
112025180600045,0045,Betina,I0,PE,,Sehat,Purwanto,Sukamaju,03/12/2025 14:27:08,,
112025180600046,0046,Betina,,PE,,Sehat,Purnomo,Sukamaju,03/12/2025 14:30:16,,
112025180600013,0013,Betina,I0,PE,,Sehat,Purwanto,Sukamaju,03/12/2025 14:31:41,,
112025180600084,0084,Betina,I0,PE,,Sehat,Purwanto,Sukamaju,03/12/2025 14:32:30,,
112025180600074,0074,Betina,I1,PE,,Sehat,Purnomo,Sukamaju,03/12/2025 14:38:13,,
112025180600021,0021,Jantan,I0,PE,,Sehat,Purnomo,Sukamaju,03/12/2025 14:39:22,,
112025180600008,0008,Betina,I3,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:41:06,,
112025180600010,0010,Jantan,I0,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:42:35,,
112025180600009,0009,Betina,I0,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:43:17,,
112025180600002,0002,Betina,I4,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:44:45,,
112025180600030,0030,Betina,I0,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:46:06,,
112025180600012,0012,Betina,I0,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:46:52,,
112025180600042,0042,Jantan,I0,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:47:29,,
112025180600043,0043,Betina,I0,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:48:13,,
112025180600080,0080,Betina,I3,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:49:09,,
112025180600041,0041,Betina,I4,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:49:59,,
112025180600050,0050,Jantan,I4,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:53:06,,
112025180600007,0007,Betina,I4,Boer,,Sehat,Lukman,Sukamaju,03/12/2025 14:54:21,,
112025180600017,0017,Betina,I4,Saburai,,Sehat,Lukman,Sukamaju,03/12/2025 14:56:00,,
112025180600040,0040,Betina,I0,Saburai,,Sehat,Lukman,Sukamaju,03/12/2025 14:56:46,,
112025180600090,0090,Betina,I0,Saburai,,Sehat,Lukman,Sukamaju,03/12/2025 14:57:39,,
112025180600054,0054,Betina,I3,Saburai,,Sehat,Sumaryono,Sukamaju,03/12/2025 15:04:51,,
112025180600053,0053,Betina,I3,Saburai,,Sehat,Sumaryono,Sukamaju,03/12/2025 15:05:47,,
112025180600086,0086,Betina,I3,Saburai,,Sehat,Sumaryono,Sukamaju,03/12/2025 15:06:47,,
112025180600003,0003,Jantan,I2,Saburai,,Sehat,Sumaryono,Sukamaju,03/12/2025 15:08:23,,
112025180600064,0064,Betina,I2,PE,,,Ahmadi,Sukamaju,03/12/2025 15:12:35,,
112025180600091,0091,Betina,I0,PE,,,Ahmadi,Sukamaju,03/12/2025 15:13:23,,
112025180600092,0092,Betina,I0,Boer,,Sehat,Edi Supatmo,Sukamaju,03/12/2025 15:13:46,,
112025180600082,0082,Betina,I0,Boer,,Sehat,Boer,Sukamaju,03/12/2025 15:14:30,,
112025180600099,0099,Jantan,I1,Saburai,,Sehat,Ahmadi,Sukamaju,03/12/2025 15:15:01,,
112025180600094,0094,Betina,I0,Boer,,Sehat,Edi Supatmo,Sukamaju,03/12/2025 15:15:11,,
112025180600028,0028,Betina,I2,Saburai,,Sehat,Ahmadi,Sukamaju,03/12/2025 15:16:09,,
112025180600066,0086,Betina,I3,Boer,,Sehat,Edi Supatmo,Sukamaju,03/12/2025 15:16:51,,
112025180600034,0034,Jantan,I0,Saburai,,Sehat,Ahmadi,Sukamaju,03/12/2025 15:17:03,,
112025180600039,0039,Betina,I2,PE,,Sehat,Edi Supatmo,Sukamaju,03/12/2025 15:17:48,,
112025180600051,0051,Betina,I1,Saburai,,,Ahmadi,Sukamaju,03/12/2025 15:17:58,,
112025180600077,0077,Betina,I4,Saburai,,Sehat,Edi Supatmo,Sukamaju,03/12/2025 15:18:39,,
112025180600061,0061,Betina,I1,Saburai,,Sehat,Ahmadi,Sukamaju,03/12/2025 15:20:10,,
112025180600070,0070,Jantan,I0,Saburai,,,Edi Supatmo,Sukamaju,03/12/2025 15:20:56,,
112025180600068,0068,Jantan,I0,Saburai,,Sehat,Edi Supatmo,Sukamaju,03/12/2025 15:21:48,,
112025180600097,0097,Betina,I3,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:25:35,,
112025180600057,0057,Betina,I3,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:26:29,,
112025180600072,0072,Betina,I0,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:27:20,,
112025180600065,0065,Jantan,I1,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:28:21,,
112025180600036,0036,Betina,I4,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:29:31,,
112025180600059,0059,Betina,I3,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:30:25,,
112025180600058,0058,Betina,I0,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:31:29,,
112025180600031,0031,Jantan,I0,Rambon,,Sehat,Walidi,Sukamaju,03/12/2025 15:32:45,,
112025180600055,0055,Betina,I2,Rambon,,Sehat,Fadlan,Sukamaju,03/12/2025 15:33:16,,
112025180600056,0056,Jantan,I1,Rambon,,Sehat,Walidi,Sukamaju,03/12/2025 15:35:10,,
112025180600075,0075,Betina,I0,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:35:32,,
112025180600085,0085,Betina,I0,Rambon,,Sehat,Walidi,Sukamaju,03/12/2025 15:36:12,,
112025180600081,0081,Jantan,I0,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:37:13,,
112025180600096,0096,Jantan,I1,Rambon,,Sehat,Walidi,Sukamaju,03/12/2025 15:37:45,,
112025180600035,0035,Betina,I2,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:38:11,,
112025180600018,0018,Betina,I0,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:38:56,,
112025180600088,0088,Betina,I0,Rambon,,Sehat,Walidi,Sukamaju,03/12/2025 15:38:58,,
112025180600182,0182,Jantan,I0,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:39:52,,
112025180600181,0081,Jantan,I1,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:40:55,,
112025180600032,0032,Betina,I3,Rambon,,Sehat,Walidi,Sukamaju,03/12/2025 15:41:38,,
112025180600147,0147,Betina,I0,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:41:49,,
112025180600143,0143,Betina,I1,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:42:58,,
112025180600052,0052,Jantan,I0,Rambon,,Sehat,Walidi,Sukamaju,03/12/2025 15:43:20,,
112025180600157,0157,Jantan,I3,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:44:04,,
112025180600029,0029,Betina,I1,Rambon,,Sehat,Walidi,Sukamaju,03/12/2025 15:45:20,,
112025180600150,0150,Betina,I3,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:45:27,,
112025180600144,0144,Betina,I3,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:46:32,,
112025180600014,0014,Jantan,I0,Rambon,,Sehat,Walidi,Sukamaju,03/12/2025 15:46:49,,
112025180600140,0140,Betina,I3,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:48:08,,
112025180600083,0083,Betina,I2,Rambon,,,Walidi,Sukamaju,03/12/2025 15:48:33,,
112025180600200,0200,Jantan,I1,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:48:53,,
112025180600172,0172,Betina,I4,Saburai,,Sehat,Fadlan,Sukamaju,03/12/2025 15:50:02,,
112025180600159,0159,Betina,I4,Saburai,,Sehat,Sunar,Sukamaju,03/12/2025 15:59:27,,
112025180600026,0026,Betina,I0,Saburai,,Sehat,Sunar,Sukamaju,03/12/2025 16:00:17,,
112025180600186,0186,Jantan,I0,Saburai,,Sehat,Sunar,Sukamaju,03/12/2025 16:00:42,,
112025180600183,0183,Betina,I3,Saburai,,Sehat,Sunar,Sukamaju,03/12/2025 16:01:20,,
112025180600135,0135,Betina,I1,Saburai,,Sehat,Sunar,Sukamaju,03/12/2025 16:02:35,,
112025180600139,0139,Betina,I0,Saburai,,Sehat,Sunar,Sukamaju,03/12/2025 16:02:45,,
112025180600076,0076,Betina,I2,Rambon,,,Agung,Sukamaju,03/12/2025 16:02:56,,
112025180600016,0016,Jantan,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:03:32,,
112025180600019,0019,Jantan,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:04:21,,
112025180600024,0024,Betina,I1,Rambon,,,Agung,Sukamaju,03/12/2025 16:05:03,,
112025180600063,0063,Betina,I1,Rambon,,,Agung,Sukamaju,03/12/2025 16:06:37,,
112025180600062,0062,Betina,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:07:03,,
112025180600025,0025,Betina,I2,Rambon,,,Agung,Sukamaju,03/12/2025 16:08:08,,
112025180600047,0047,Betina,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:08:55,,
112025180600023,0023,Betina,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:09:21,,
112025180600073,0073,Jantan,I1,Saburai,,,Agung,Sukamaju,03/12/2025 16:11:19,,
112025180600179,0179,Betina,I3,Saburai,,Sehat,Triana Ariyanto,Sukamaju,03/12/2025 16:11:42,,
112025180600163,0163,Betina,I0,Saburai,,Sehat,Triana Ariyanto,Sukamaju,03/12/2025 16:12:01,,
112025180600078,0078,Jantan,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:12:20,,
112025180600093,0093,Betina,I1,Rambon,,,Agung,Sukamaju,03/12/2025 16:13:11,,
112025180600069,0069,Betina,I1,Rambon,,,Agung,Sukamaju,03/12/2025 16:14:19,,
112025180600095,0095,Jantan,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:14:45,,
112025180600067,0067,Jantan,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:15:11,,
112025180600049,0049,Betina,I1,Rambon,,,Agung,Sukamaju,03/12/2025 16:16:26,,
112025180600038,0038,Betina,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:17:04,,
112025180600175,0175,Betina,I0,Rambon,,Sehat,Trinono,Sukamaju,03/12/2025 16:17:20,,
112025180600171,0071,Jantan,I0,Rambon,,Sehat,Triono,Sukamaju,03/12/2025 16:17:40,,
112025180600177,0177,Jantan,I0,Rambon,,Sehat,Triono,Sukamaju,03/12/2025 16:18:37,,
112025180600160,0160,Jantan,I0,Rambon,,Sehat,Triono,Sukamaju,03/12/2025 16:19:06,,
112025180600098,0098,Betina,I2,Rambon,,,Agung,Sukamaju,03/12/2025 16:19:18,,
112025180600048,0048,Betina,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:19:55,,
112025180600027,0027,Betina,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:21:04,,
112025180600071,0071,Betina,I1,Rambon,,,Agung,Sukamaju,03/12/2025 16:22:02,,
112025180600037,0037,Betina,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:23:29,,
112025180600089,0089,Betina,I2,Rambon,,,Agung,Sukamaju,03/12/2025 16:24:09,,
112025180600152,0152,Betina,I2,Rambon,,,Agung,Sukamaju,03/12/2025 16:41:56,,
112025180600184,0184,Jantan,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:42:40,,
112025180600195,0195,Jantan,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:43:50,,
112025180600148,0148,Betina,I0,Rambon,,,Agung,Sukamaju,03/12/2025 16:44:17,,
112025180600141,0141,Betina,I2,Rambon,,,Agung,Sukamaju,03/12/2025 16:45:13,,
112025180600164,0164,Betina,I1,Rambon,,,Agung,Sukamaju,03/12/2025 16:46:18,,
112025180600228,0228,Betina,I1,PE,,Sehat,Riyono,Sukamaju,04/12/2025 14:56:15,,
112025180600226,0226,Jantan,I1,PE,,Sehat,Riyono,Sukamaju,04/12/2025 14:58:28,,
112025180600250,0250,Betina,I2,PE,,Sehat,Riyono,Sukamaju,04/12/2025 15:00:15,,
112025180600203,0203,Jantan,I0,PE,,Sehat,Riyono,Sukamaju,04/12/2025 15:02:14,,0250
112025180600210,0210,Betina,I0,PE,,Sehat,Riyono,Sukamaju,04/12/2025 15:03:23,,0250
112025180600259,0259,Betina,I2,PE,,Sehat,Riyono,Sukamaju,04/12/2025 15:04:31,,
112025180600223,0223,Jantan,I0,PE,,Sehat,Riyono,Sukamaju,04/12/2025 15:05:27,,0259
112025180600282,0282,Betina,I3,PE,,Sehat,Riyono,Sukamaju,04/12/2025 15:09:10,,
112025180600218,0218,Jantan,I0,PE,,Sehat,Riyono,Sukamaju,04/12/2025 15:10:26,,0282
112025180600201,0201,Jantan,I0,PE,,Sehat,Riyono,Sukamaju,04/12/2025 15:11:08,,0282
112025180600271,0271,Betina,I2,Rambon,,,Sugeng,Sukamaju,04/12/2025 15:15:52,,
112025180600285,0285,Jantan,I0,Rambon,22,Sehat,Agus,Sukamaju,04/12/2025 15:17:44,,0271
112025180600281,0281,Jantan,I0,Rambon,,,Agus,Sukamaju,04/12/2025 15:18:19,,0271
112025180600243,0243,Betina,I2,Rambon,,,Sugeng,Sukamaju,04/12/2025 15:20:57,,
112025180600262,0262,Jantan,I0,Rambon,21,Sehat,Sugeng,Sukamaju,04/12/2025 15:21:30,,0243
112025180600251,0251,Jantan,I0,Rambon,,,Sugeng,Sukamaju,04/12/2025 15:22:09,,0243
112025180600268,0268,Betina,I2,Rambon,,,Sugeng,Sukamaju,04/12/2025 15:23:17,,
112025180600273,0273,Betina,I2,Rambon,,,Sugeng,Sukamaju,04/12/2025 15:24:37,,
112025180600237,0237,Jantan,I1,Saburai,,,Agus,Sukamaju,04/12/2025 15:32:01,,
112025180600270,0270,Jantan,I4,Saburai,,Sehat,Fajar Irawan,Sukamaju,04/12/2025 15:32:29,,
112025180600269,0269,Betina,I2,Saburai,,,Agus,Sukamaju,04/12/2025 15:32:41,,
112025180600109,0109,Betina,I0,Saburai,,,Agus,Sukamaju,04/12/2025 15:33:31,,0269
112025180600221,0221,Betina,I3,Saburai,,Sehat,Fajar Irawan,Sukamaju,04/12/2025 15:34:06,,
112025180600244,0244,Betina,I0,Saburai,,Sehat,Fajar Irawan,Sukamaju,04/12/2025 15:34:53,,
112025180600103,0103,Betina,I1,Saburai,,,Agus,Sukamaju,04/12/2025 15:35:17,,
112025180600129,0129,Betina,I2,Saburai,,,Agus,Sukamaju,04/12/2025 15:36:29,,
112025180600219,0219,Betina,I1,Saburai,,Sehat,Fajar Irawan,Sukamaju,04/12/2025 15:36:48,,
112025180600256,0256,Betina,I0,Saburai,,Sehat,Fajar Irawan,Sukamaju,04/12/2025 15:37:49,,
112025180600111,0111,Betina,I2,Saburai,,,Agus,Sukamaju,04/12/2025 15:38:20,,
112025180600287,0287,Betina,I0,Saburai,,Sehat,Fajar Irawan,Sukamaju,04/12/2025 15:38:32,,
112025180600128,0128,Betina,I2,Saburai,,,Agus,Sukamaju,04/12/2025 15:39:03,,
112025180600190,0190,Jantan,I0,Saburai,,,Agus,Sukamaju,04/12/2025 15:39:50,,0128
112025180600178,0178,Betina,I3,Saburai,,,Agus,Sukamaju,04/12/2025 15:40:48,,
112025180600168,0168,Betina,I0,Saburai,,,Agus,Sukamaju,04/12/2025 15:41:38,,0178
112025180600120,0120,Jantan,I0,Saburai,,,Agus,Sukamaju,04/12/2025 15:42:21,,0269
112025180600292,0292,Betina,I0,Rambon x Boer,,Sehat,Hendra,Sukamaju,04/12/2025 15:42:57,,
112025180600113,0113,Betina,I3,Saburai,,,Agus,Sukamaju,04/12/2025 15:44:05,,
112025180600217,0217,Betina,I2,Boer,,Sehat,Hendra,Sukamaju,04/12/2025 15:45:11,,
112025180600277,0277,Betina,I0,Boer Cross,,Sehat,Hendra,Sukamaju,04/12/2025 15:46:36,,
112025180600225,0225,Betina,I3,Boer Cross,,Sehat,Hendra,Sukamaju,04/12/2025 15:48:40,,
112025180600232,0232,Betina,I1,Boer Cross,,Sehat,Hendra,Sukamaju,04/12/2025 15:49:54,,
112025180600254,0254,Betina,I4,Boer Cross,,Sehat,Hendra,Sukamaju,04/12/2025 15:51:13,,
112025180600222,0222,Betina,I0,Boer Cross,,,Hendra,Sukamaju,04/12/2025 15:52:39,,
112025180600204,0204,Jantan,I0,Boer Cross,,,Hendra,Sukamaju,04/12/2025 15:53:23,,
112025180600427,0427,Betina,I0,Saburai,,,Agus,Sukamaju,04/12/2025 15:53:49,,0113
112025180600205,0205,Betina,I0,Boer Cross,,Sehat,Hendra,Sukamaju,04/12/2025 15:54:02,,
112025180600475,0457,Betina,I0,Saburai,,,Agus,Sukamaju,04/12/2025 15:54:18,,0113
112025180600272,0272,Betina,I0,Boer Cross,,,Hendra,Sukamaju,04/12/2025 15:54:38,,
112025180600240,0240,Betina,I0,Boer Cross,,Sehat,Hendra,Sukamaju,04/12/2025 15:55:27,,
112025180600102,0102,Betina,I0,Saburai,,,Agus,Sukamaju,04/12/2025 15:56:35,,0178
112025180600459,0459,Jantan,I1,Rambon,,,Sarbini,Sukamaju,04/12/2025 16:34:28,,
112025180600476,0476,Jantan,I1,Rambon,,,Sarbini,Sukamaju,04/12/2025 16:35:16,,
112025180600402,0402,Betina,I3,Rambon,,,Sarbini,Sukamaju,04/12/2025 16:36:42,,
112025180600446,0446,Jantan,I0,Rambon,,,Sarbini,Sukamaju,04/12/2025 16:37:16,,0402
112025180600481,0481,Jantan,I3,Rambon,,,Sarbini,Sukamaju,04/12/2025 16:39:55,,
112025180600456,0456,Betina,I3,Rambon,,,Sarbini,Sukamaju,04/12/2025 16:41:05,,
112025180600443,0443,Jantan,I1,Rambon,,,Sarbini,Sukamaju,04/12/2025 16:41:53,,
112025180600411,0411,Jantan,I2,Rambon,,,Sarbini,Sukamaju,04/12/2025 16:42:55,,
112025180600438,0438,Jantan,I2,Rambon,,,Sarbini,Sukamaju,04/12/2025 16:43:54,,
112025180600461,0461,Betina,I4,PE,,Sehat,Ibrahim,Sukamaju,04/12/2025 16:44:52,,
112025180600478,0478,Betina,I1,Kambing Kacang,,,Sarbini,Sukamaju,04/12/2025 16:45:38,,
112025180600474,0474,Jantan,I0,PE,,Sehat,Ibrahim,Sukamaju,04/12/2025 16:46:12,,
112025180600486,0486,Jantan,I0,PE,,Sehat,Ibrahim,Sukamaju,04/12/2025 16:46:46,,
112025180600418,0418,Jantan,I3,Saburai,,,Sarbini,Sukamaju,04/12/2025 16:47:01,,
112025180600415,0415,Betina,I0,PE,,Sehat,Ibrahim,Sukamaju,04/12/2025 16:47:48,,
112025180600499,0499,Betina,I3,Saburai,,,Sarbini,Sukamaju,04/12/2025 16:48:20,,
112025180600467,0467,Betina,I2,Kambing Kacang,,,Sarbini,Sukamaju,04/12/2025 16:50:14,,
112025180600489,0489,Betina,I0,Kambing Kacang,,,Sarbini,Sukamaju,04/12/2025 16:50:51,,0467
112025180600441,0441,Betina,I1,Saburai,,,Sarbini,Sukamaju,04/12/2025 16:51:41,,
112025180600435,0435,Jantan,I2,Saburai,,,Sarbini,Sukamaju,04/12/2025 16:52:26,,
112025180600462,0462,Jantan,I0,Boer Cross,,Sehat,Adi Purnomo,Sukamaju,04/12/2025 16:56:33,,
112025180600493,0493,Betina,I0,Boer Cross,,Sehat,Adi Purnomo,Sukamaju,04/12/2025 16:57:33,,
112025180600477,0477,Betina,I0,Boer Cross,,Sehat,Adi Purnomo,Sukamaju,04/12/2025 16:58:12,,
112025180600464,0464,Jantan,I0,PE,,,Rudi,Sukamaju,04/12/2025 17:06:54,,
112025180600473,0473,Betina,I3,Saburai,,Sehat,Fajar F,Sukamaju,04/12/2025 17:07:10,,
112025180600469,0469,Betina,I0,Saburai,,Sehat,Fajar F,Sukamaju,04/12/2025 17:08:08,,
112025180600480,0480,Betina,I1,PE,,,Rudi,Sukamaju,04/12/2025 17:08:09,,
112025180600436,0436,Jantan,I0,PE,,,Rudi,Sukamaju,04/12/2025 17:09:20,,
112025180600483,0483,Betina,I0,PE,,,Rudi,Sukamaju,04/12/2025 17:10:51,,
112025180600447,0447,Betina,I0,PE,,,Rudi,Sukamaju,04/12/2025 17:12:17,,
112025180600458,0458,Betina,I1,Saburai,,Sehat,Saipudin,Sukamaju,04/12/2025 17:16:51,,
112025180600494,0494,Betina,I0,Saburai,,Sehat,Saipudin,Sukamaju,04/12/2025 17:18:07,,
112025180600425,0425,Betina,I3,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:32:21,,
112025180600442,0442,Betina,I2,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:33:15,,
112025180600498,0498,Jantan,I1,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:34:36,,0425
112025180600410,0410,Betina,I2,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:35:37,,0442
112025180600491,0491,Betina,I1,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:37:04,,
112025180600457,0457,Betina,I1,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:38:17,,0442
112025180600439,0439,Betina,I1,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:38:55,,0442
112025180600451,0451,Jantan,I1,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:41:12,,
112025180600472,0472,Betina,I1,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:42:13,,
112025180600437,0437,Betina,I3,Rambon,,,Yunanto,Sukamaju,04/12/2025 17:44:03,,
112025180600448,0448,Jantan,I0,Rambon,,,Yunanto,Sukamaju,04/12/2025 17:45:03,,0437
112025180600440,0440,Betina,I1,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:47:00,,0442
112025180600428,0428,Betina,I0,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:47:31,,
112025180600465,0465,Jantan,I0,Saburai,,,Yunanto,Sukamaju,04/12/2025 17:48:10,,
112025180601000,1000,Jantan,I0,PE,,Sehat,Purwanto,Sukamaju,06/12/2025 8:06:55,,
112025180600400,0400,Jantan,I0,PE,,Sehat,Sunar,Sukamaju,06/12/2025 8:36:14,,
112025180600372,0372,Betina,I3,Rambon,,,Koniman,Sukamaju,09/12/2025 16:37:14,,
112025180600319,0319,Betina,I0,Rambon,,,Koniman,Sukamaju,09/12/2025 16:38:10,,
112025180600328,0328,Jantan,I0,Rambon,,,Koniman,Sukamaju,09/12/2025 16:42:37,,
112025180600317,0317,Jantan,I2,Rambon,,,Koniman,Sukamaju,09/12/2025 16:44:35,,
112025180600313,0313,Betina,I2,Cros boer,35,Sehat,Fajar Irawan,Sukamaju,15/12/2025 22:28:54,Junior 027#,CB 023#
112025180600655,0655,Betina,I4,Rambon,,Sehat,Lukman,Sukamaju,17/12/2025 9:54:34,,
`;

// Calculate realistic default weight based on breed, age & sex if blank in field CSV
function getBaselineWeight(bangsa: string, umur: UmurKategori, jenisKelamin: JenisKelamin, indexSeed: number): number {
  let base = 20;
  if (umur === 'I0') base = 19;
  else if (umur === 'I1') base = 28;
  else if (umur === 'I2') base = 37;
  else if (umur === 'I3') base = 46;
  else if (umur === 'I4') base = 54;

  const b = bangsa.toLowerCase();
  if (b.includes('boer')) base += 7;
  else if (b.includes('pe')) base += 4;
  else if (b.includes('saburai')) base += 2;
  else if (b.includes('kacang')) base -= 6;
  else if (b.includes('jawa randu')) base -= 2;

  if (jenisKelamin === 'Jantan') base += 3.5;

  const variance = ((indexSeed * 7 + 13) % 11) - 5; // -5 to +5 variance
  return Math.max(12, Math.round((base + variance * 0.7) * 10) / 10);
}

// Normalize breed names cleanly
function normalizeBangsa(raw: string): string {
  const t = raw.trim();
  if (!t) return 'PE';
  const l = t.toLowerCase();
  if (l === 'pe') return 'PE';
  if (l.includes('boer cross') || l === 'bx' || l === 'cros boer' || l.includes('rambon x boer')) return 'Boer Cross (Bx)';
  if (l.includes('boer')) return 'Boer';
  if (l.includes('saburai')) return 'Saburai';
  if (l.includes('rambon')) return 'Rambon';
  if (l.includes('jawa randu')) return 'Jawa Randu';
  if (l.includes('kacang')) return 'Kambing Kacang';
  return t;
}

// Generate realistic diet specification
function getDefaultFeed(bangsa: string, umur: UmurKategori): { jenisPakan: string; komposisi: string; frekuensi: string; porsi: number } {
  const isDewasa = umur === 'I3' || umur === 'I4';
  return {
    jenisPakan: 'Hijauan Segar + Konsentrat Penguat',
    komposisi: 'Rumput Odot 65% + Daun Indigofera 20% + Konsentrat Dedak Padi/Bungkil 15%',
    frekuensi: '2x Sehari (08.00 WIB & 15.30 WIB)',
    porsi: isDewasa ? 4.5 : 2.8,
  };
}

export function parseInitialData(): GoatRecord[] {
  const lines = rawCsvData.trim().split('\n');
  const records: GoatRecord[] = [];

  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    const cols = line.split(',');

    const nomorRfid = (cols[0] || '').trim();
    const nomorEartag = (cols[1] || '').trim();
    const rawSex = (cols[2] || '').trim().toLowerCase();
    const jenisKelamin: JenisKelamin = rawSex.startsWith('j') ? 'Jantan' : 'Betina';

    let rawUmur = (cols[3] || '').trim().toUpperCase();
    if (!['I0', 'I1', 'I2', 'I3', 'I4'].includes(rawUmur)) {
      rawUmur = 'I0';
    }
    const umur: UmurKategori = rawUmur as UmurKategori;

    const bangsaTernak = normalizeBangsa(cols[4] || '');

    // Parse weight if present
    const rawBobot = parseFloat(cols[5] || '');
    const bobotBadan = !isNaN(rawBobot) && rawBobot > 0 ? rawBobot : getBaselineWeight(bangsaTernak, umur, jenisKelamin, idx);

    // Health status
    const rawHealth = (cols[6] || '').trim().toLowerCase();
    let statusKesehatan: StatusKesehatanUtama = 'Sehat';
    if (rawHealth.includes('sakit')) {
      statusKesehatan = 'Sakit';
    } else if (rawHealth.includes('rawat')) {
      statusKesehatan = 'Dalam Perawatan';
    }

    // Give a small realistic subset sample medical records for clinical testing (e.g. 5 animals)
    const riwayatKesehatan: GoatRecord['riwayatKesehatan'] = [];
    if (idx === 8) {
      statusKesehatan = 'Dalam Perawatan';
      riwayatKesehatan.push({
        id: `med-${idx}-1`,
        tanggalPemeriksaan: '2025-12-08',
        jenisPenyakit: 'Scabies (Kudis telinga)',
        pengobatanDiberikan: 'Injeksi Ivermectin 1ml s.c. & Salep Belerang',
        kondisiSaatIni: 'Membaik',
        petugas: 'Drh. Bambang (PPL)',
        catatan: 'Isolasi di sekat terpisah, kontrol ulang 7 hari.',
      });
    } else if (idx === 21) {
      statusKesehatan = 'Dalam Perawatan';
      riwayatKesehatan.push({
        id: `med-${idx}-1`,
        tanggalPemeriksaan: '2025-12-10',
        jenisPenyakit: 'Kembung / Bloat (Tympani akut)',
        pengobatanDiberikan: 'Minyak nabati 50ml + Bloat Stop oral + Vitamin B Kompleks',
        kondisiSaatIni: 'Sembuh',
        petugas: 'Mantri Hewan Sukamaju',
        catatan: 'Nafsu makan sudah kembali normal.',
      });
    } else if (idx === 34) {
      riwayatKesehatan.push({
        id: `med-${idx}-1`,
        tanggalPemeriksaan: '2025-11-20',
        jenisPenyakit: 'ORF / Ecthyma Contagiosa (Keropeng mulut)',
        pengobatanDiberikan: 'Olesan Gentian Violet 1% + Injeksi Biodin',
        kondisiSaatIni: 'Sembuh',
        petugas: 'Tim Kesehatan Ternak',
        catatan: 'Keropeng telah rontok, luka sembuh total.',
      });
    } else if (rawHealth.includes('sehat')) {
      riwayatKesehatan.push({
        id: `med-${idx}-init`,
        tanggalPemeriksaan: (cols[9] || '').split(' ')[0] || '2025-12-03',
        jenisPenyakit: 'Pemeriksaan Rutin (Kondisi Sehat)',
        pengobatanDiberikan: 'Pemberian Obat Cacing Albendazole & Vitamin ADE',
        kondisiSaatIni: 'Sembuh',
        petugas: 'Petugas Lapangan',
        catatan: 'Mata cerah, bulu mengkilap, nafsu makan baik.',
      });
    }

    const namaPeternak = (cols[7] || 'Peternak').trim();
    const lokasi = (cols[8] || 'Sukamaju').trim();
    const timestampAwal = (cols[9] || '').trim();
    const nomorPejantan = (cols[10] || '').trim() || undefined;
    const nomorInduk = (cols[11] || '').trim() || undefined;

    const feedInfo = getDefaultFeed(bangsaTernak, umur);

    // Sampel riwayat penimbangan berkala & pakan harian terhubung untuk demonstrasi ilmiah
    const riwayatBobotList: RiwayatBobot[] = [
      {
        tanggal: timestampAwal ? timestampAwal.split(' ')[0] : '2025-12-03',
        bobot: bobotBadan,
        catatan: 'Penimbangan awal saat registrasi RFID lapangan',
      },
    ];

    const riwayatPakanList: CatatanPakanHarian[] = [];

    if (idx === 0) {
      // Kambing 0004 (PE Betina)
      riwayatBobotList.push(
        {
          tanggal: '2026-01-08',
          bobot: Math.round((bobotBadan + 2.7) * 10) / 10,
          catatan: 'Penimbangan berkala bulan ke-1',
          pakanSaatTimbang: 'Rumput Odot (2.8 kg) + Konsentrat Dedak Bungkil (0.35 kg)',
          lingkarDadaCm: 68.5,
          petugasPenimbang: 'Ahmad Shodiq',
        },
        {
          tanggal: '2026-02-15',
          bobot: Math.round((bobotBadan + 5.6) * 10) / 10,
          catatan: 'Monitoring pertumbuhan dara bunting',
          pakanSaatTimbang: 'Rumput Pakchong (3.0 kg) + Konsentrat Penguat (0.4 kg)',
          lingkarDadaCm: 71.0,
          petugasPenimbang: 'Ahmad Shodiq',
        }
      );

      riwayatPakanList.push(
        {
          id: `feed-${idx}-1`,
          tanggal: '2025-12-15',
          jenisHijauan: 'Rumput Odot Segar (Pennisetum purpureum cv Mott)',
          takaranHijauanKg: 2.8,
          jenisKonsentrat: 'Dedak Padi Halus Super + Bungkil Sawit (1:1)',
          takaranKonsentratKg: 0.35,
          frekuensi: '2x Sehari (Pagi & Sore)',
          suplemenMineral: 'Premix Mineral + Garam Dapur',
          nafsuMakan: 'Sangat Lahap (Habis)' as const,
          biayaPakanHarianRp: 2310,
          petugas: 'Ahmad Shodiq',
          catatan: 'Diberikan hijauan layu pagi hari, konsentrat sore hari',
        },
        {
          id: `feed-${idx}-2`,
          tanggal: '2026-01-20',
          jenisHijauan: 'Rumput Pakchong / Super Napier',
          takaranHijauanKg: 3.0,
          jenisKonsentrat: 'Konsentrat Penggemukan Komersil (PK 16%, TDN 70%)',
          takaranKonsentratKg: 0.4,
          frekuensi: '2x Sehari (Pagi & Sore)',
          suplemenMineral: 'Premix Mineral + Probiotik EM4',
          nafsuMakan: 'Sangat Lahap (Habis)' as const,
          biayaPakanHarianRp: 3000,
          petugas: 'Ahmad Shodiq',
          catatan: 'Nafsu makan sangat baik, pakan habis tak tersisa',
        }
      );
    } else if (idx === 2) {
      // Kambing 0001 (PE Jantan Unggul Penggemukan)
      riwayatBobotList.push(
        {
          tanggal: '2026-01-05',
          bobot: Math.round((bobotBadan + 4.5) * 10) / 10,
          catatan: 'Penimbangan intensif program penggemukan kurban',
          pakanSaatTimbang: 'Rumput Odot + Daun Indigofera (3.5 kg) + Konsentrat Unila (0.75 kg)',
          lingkarDadaCm: 73.0,
          petugasPenimbang: 'Drh. Hendra Kurniawan',
        },
        {
          tanggal: '2026-02-12',
          bobot: Math.round((bobotBadan + 9.8) * 10) / 10,
          catatan: 'Penimbangan berkala tahap akhir penggemukan',
          pakanSaatTimbang: 'Rumput Pakchong (3.8 kg) + Konsentrat Penggemukan 16% (0.85 kg)',
          lingkarDadaCm: 77.5,
          petugasPenimbang: 'Drh. Hendra Kurniawan',
        }
      );

      riwayatPakanList.push(
        {
          id: `feed-${idx}-1`,
          tanggal: '2025-12-12',
          jenisHijauan: 'Daun Indigofera zollingeriana (Legum PK Tinggi)',
          takaranHijauanKg: 3.5,
          jenisKonsentrat: 'Formulasi Riset Fapet Unila (Jagung 40% + Bungkil 30% + Dedak 28% + Premix 2%)',
          takaranKonsentratKg: 0.75,
          frekuensi: '3x Sehari (Pagi, Siang, & Sore)',
          suplemenMineral: 'Premix Mineral + Molasses',
          nafsuMakan: 'Sangat Lahap (Habis)' as const,
          biayaPakanHarianRp: 5250,
          petugas: 'Tim Kandang Sukamaju',
          catatan: 'Ransum protein tinggi untuk pacu pertumbuhan otot',
        },
        {
          id: `feed-${idx}-2`,
          tanggal: '2026-01-15',
          jenisHijauan: 'Rumput Pakchong / Super Napier',
          takaranHijauanKg: 3.8,
          jenisKonsentrat: 'Konsentrat Penggemukan Komersil (PK 16%, TDN 70%)',
          takaranKonsentratKg: 0.85,
          frekuensi: '2x Sehari (Pagi 07.30 & Sore 16.00 WIB)',
          suplemenMineral: 'Premix Mineral + Garam Dapur',
          nafsuMakan: 'Sangat Lahap (Habis)' as const,
          biayaPakanHarianRp: 5345,
          petugas: 'Tim Kandang Sukamaju',
          catatan: 'Kondisi ternak sangat aktif dan pertambahan bobot pesat',
        }
      );
    } else if (idx === 6) {
      // Kambing 0100 (PE Jantan I3)
      riwayatBobotList.push({
        tanggal: '2026-01-20',
        bobot: Math.round((bobotBadan + 3.2) * 10) / 10,
        catatan: 'Penimbangan rutin pejantan',
        pakanSaatTimbang: 'Rumput Lapang (3.5 kg) + Dedak Padi (0.5 kg)',
        lingkarDadaCm: 75.0,
        petugasPenimbang: 'Purnomo (Peternak)',
      });

      riwayatPakanList.push({
        id: `feed-${idx}-1`,
        tanggal: '2026-01-10',
        jenisHijauan: 'Rumput Odot Segar (Pennisetum purpureum cv Mott)',
        takaranHijauanKg: 3.5,
        jenisKonsentrat: 'Dedak Padi Halus Super + Bungkil Sawit (1:1)',
        takaranKonsentratKg: 0.5,
        frekuensi: '2x Sehari (Pagi & Sore)',
        suplemenMineral: 'Garam Dapur + Mineral Sapi/Kambing',
        nafsuMakan: 'Normal' as const,
        biayaPakanHarianRp: 3125,
        petugas: 'Purnomo',
        catatan: 'Pakan hijauan hasil kebun sendiri',
      });
    }

    const latestWeight = riwayatBobotList[riwayatBobotList.length - 1].bobot;

    records.push({
      id: nomorRfid || `goat-${idx}`,
      nomorRfid: nomorRfid,
      nomorEartag: nomorEartag || `ET-${idx + 1}`,
      namaPeternak: namaPeternak,
      lokasi: lokasi,
      bangsaTernak: bangsaTernak,
      bobotBadan: latestWeight,
      umur: umur,
      jenisKelamin: jenisKelamin,
      statusKesehatan: statusKesehatan,
      riwayatKesehatan: riwayatKesehatan,
      riwayatBobot: riwayatBobotList,
      riwayatPakanHarian: riwayatPakanList,
      pakan: {
        jenisPakan: feedInfo.jenisPakan,
        komposisiPakan: feedInfo.komposisi,
        frekuensiPemberian: feedInfo.frekuensi,
        jumlahHarianKg: feedInfo.porsi,
        catatanPakan: 'Diberikan hijauan layu untuk mencegah kembung',
      },
      nomorPejantan: nomorPejantan,
      nomorInduk: nomorInduk,
      timestampAwal: timestampAwal,
      updatedAt: new Date().toISOString(),
    });
  });

  return records;
}
