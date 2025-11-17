/**
 * FEDERAL EXPRESS BRASIL
 * Types: Exchange Rates
 */

export interface ExchangeRate {
  base_code: string;
  currency_code: string;
  rate: number;
  time_last_update_unix?: number;
  time_last_update_utc?: string;
  time_next_update_unix?: number;
  time_next_update_utc?: string;
  fetched_at?: string;
}

export interface ExchangeRatesResponse {
  base_code: string;
  rates: Record<string, number>;
  cached: boolean;
  last_update?: string;
  timestamp: string;
}

export interface ConversionResponse {
  from: string;
  to: string;
  amount: number;
  converted_amount: number;
  rate: number;
  cached: boolean;
  timestamp: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
  flag?: string;
}

export const POPULAR_CURRENCIES: Currency[] = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', flag: '🇨🇳' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
];

export const ALL_CURRENCIES: Currency[] = [
  { code: 'AED', name: 'Dirham dos Emirados', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'AFN', name: 'Afghani do Afeganistão', symbol: '؋', flag: '🇦🇫' },
  { code: 'ALL', name: 'Lek Albanês', symbol: 'L', flag: '🇦🇱' },
  { code: 'AMD', name: 'Dram Armênio', symbol: '֏', flag: '🇦🇲' },
  { code: 'ANG', name: 'Florim das Antilhas', symbol: 'ƒ', flag: '🇳🇱' },
  { code: 'AOA', name: 'Kwanza Angolano', symbol: 'Kz', flag: '🇦🇴' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', flag: '🇦🇺' },
  { code: 'AWG', name: 'Florim de Aruba', symbol: 'ƒ', flag: '🇦🇼' },
  { code: 'AZN', name: 'Manat Azeri', symbol: '₼', flag: '🇦🇿' },
  { code: 'BAM', name: 'Marco Conversível', symbol: 'KM', flag: '🇧🇦' },
  { code: 'BBD', name: 'Dólar de Barbados', symbol: '$', flag: '🇧🇧' },
  { code: 'BDT', name: 'Taka de Bangladesh', symbol: '৳', flag: '🇧🇩' },
  { code: 'BGN', name: 'Lev Búlgaro', symbol: 'лв', flag: '🇧🇬' },
  { code: 'BHD', name: 'Dinar do Bahrein', symbol: '.د.ب', flag: '🇧🇭' },
  { code: 'BIF', name: 'Franco do Burundi', symbol: 'Fr', flag: '🇧🇮' },
  { code: 'BMD', name: 'Dólar das Bermudas', symbol: '$', flag: '🇧🇲' },
  { code: 'BND', name: 'Dólar de Brunei', symbol: '$', flag: '🇧🇳' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs.', flag: '🇧🇴' },
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷' },
  { code: 'BSD', name: 'Dólar das Bahamas', symbol: '$', flag: '🇧🇸' },
  { code: 'BTN', name: 'Ngultrum do Butão', symbol: 'Nu.', flag: '🇧🇹' },
  { code: 'BWP', name: 'Pula de Botswana', symbol: 'P', flag: '🇧🇼' },
  { code: 'BYN', name: 'Rublo Bielorrusso', symbol: 'Br', flag: '🇧🇾' },
  { code: 'BZD', name: 'Dólar de Belize', symbol: '$', flag: '🇧🇿' },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CDF', name: 'Franco Congolês', symbol: 'Fr', flag: '🇨🇩' },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
  { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', flag: '🇨🇳' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
  { code: 'CRC', name: 'Colón Costarriquenho', symbol: '₡', flag: '🇨🇷' },
  { code: 'CUP', name: 'Peso Cubano', symbol: '$', flag: '🇨🇺' },
  { code: 'CVE', name: 'Escudo Cabo-verdiano', symbol: '$', flag: '🇨🇻' },
  { code: 'CZK', name: 'Coroa Tcheca', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'DJF', name: 'Franco do Djibuti', symbol: 'Fr', flag: '🇩🇯' },
  { code: 'DKK', name: 'Coroa Dinamarquesa', symbol: 'kr', flag: '🇩🇰' },
  { code: 'DOP', name: 'Peso Dominicano', symbol: '$', flag: '🇩🇴' },
  { code: 'DZD', name: 'Dinar Argelino', symbol: 'د.ج', flag: '🇩🇿' },
  { code: 'EGP', name: 'Libra Egípcia', symbol: '£', flag: '🇪🇬' },
  { code: 'ERN', name: 'Nakfa da Eritreia', symbol: 'Nfk', flag: '🇪🇷' },
  { code: 'ETB', name: 'Birr Etíope', symbol: 'Br', flag: '🇪🇹' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'FJD', name: 'Dólar de Fiji', symbol: '$', flag: '🇫🇯' },
  { code: 'FKP', name: 'Libra das Malvinas', symbol: '£', flag: '🇫🇰' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'GEL', name: 'Lari Georgiano', symbol: '₾', flag: '🇬🇪' },
  { code: 'GHS', name: 'Cedi Ganês', symbol: '₵', flag: '🇬🇭' },
  { code: 'GIP', name: 'Libra de Gibraltar', symbol: '£', flag: '🇬🇮' },
  { code: 'GMD', name: 'Dalasi da Gâmbia', symbol: 'D', flag: '🇬🇲' },
  { code: 'GNF', name: 'Franco Guineano', symbol: 'Fr', flag: '🇬🇳' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', symbol: 'Q', flag: '🇬🇹' },
  { code: 'GYD', name: 'Dólar Guianense', symbol: '$', flag: '🇬🇾' },
  { code: 'HKD', name: 'Dólar de Hong Kong', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'HNL', name: 'Lempira Hondurenha', symbol: 'L', flag: '🇭🇳' },
  { code: 'HRK', name: 'Kuna Croata', symbol: 'kn', flag: '🇭🇷' },
  { code: 'HTG', name: 'Gourde Haitiano', symbol: 'G', flag: '🇭🇹' },
  { code: 'HUF', name: 'Florim Húngaro', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'IDR', name: 'Rupia Indonésia', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'ILS', name: 'Shekel Israelense', symbol: '₪', flag: '🇮🇱' },
  { code: 'INR', name: 'Rupia Indiana', symbol: '₹', flag: '🇮🇳' },
  { code: 'IQD', name: 'Dinar Iraquiano', symbol: 'ع.د', flag: '🇮🇶' },
  { code: 'IRR', name: 'Rial Iraniano', symbol: '﷼', flag: '🇮🇷' },
  { code: 'ISK', name: 'Coroa Islandesa', symbol: 'kr', flag: '🇮🇸' },
  { code: 'JMD', name: 'Dólar Jamaicano', symbol: 'J$', flag: '🇯🇲' },
  { code: 'JOD', name: 'Dinar Jordaniano', symbol: 'د.ا', flag: '🇯🇴' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵' },
  { code: 'KES', name: 'Xelim Queniano', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'KGS', name: 'Som Quirguiz', symbol: 'с', flag: '🇰🇬' },
  { code: 'KHR', name: 'Riel Cambojano', symbol: '៛', flag: '🇰🇭' },
  { code: 'KMF', name: 'Franco Comorense', symbol: 'Fr', flag: '🇰🇲' },
  { code: 'KRW', name: 'Won Sul-Coreano', symbol: '₩', flag: '🇰🇷' },
  { code: 'KWD', name: 'Dinar Kuwaitiano', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'KYD', name: 'Dólar das Ilhas Cayman', symbol: '$', flag: '🇰🇾' },
  { code: 'KZT', name: 'Tenge Cazaque', symbol: '₸', flag: '🇰🇿' },
  { code: 'LAK', name: 'Kip Laosiano', symbol: '₭', flag: '🇱🇦' },
  { code: 'LBP', name: 'Libra Libanesa', symbol: 'ل.ل', flag: '🇱🇧' },
  { code: 'LKR', name: 'Rupia do Sri Lanka', symbol: 'Rs', flag: '🇱🇰' },
  { code: 'LRD', name: 'Dólar Liberiano', symbol: '$', flag: '🇱🇷' },
  { code: 'LSL', name: 'Loti do Lesoto', symbol: 'L', flag: '🇱🇸' },
  { code: 'LYD', name: 'Dinar Líbio', symbol: 'ل.د', flag: '🇱🇾' },
  { code: 'MAD', name: 'Dirham Marroquino', symbol: 'د.م.', flag: '🇲🇦' },
  { code: 'MDL', name: 'Leu Moldavo', symbol: 'L', flag: '🇲🇩' },
  { code: 'MGA', name: 'Ariary Malgaxe', symbol: 'Ar', flag: '🇲🇬' },
  { code: 'MKD', name: 'Dinar Macedônio', symbol: 'ден', flag: '🇲🇰' },
  { code: 'MMK', name: 'Quiate de Mianmar', symbol: 'K', flag: '🇲🇲' },
  { code: 'MNT', name: 'Tugrik Mongol', symbol: '₮', flag: '🇲🇳' },
  { code: 'MOP', name: 'Pataca de Macau', symbol: 'P', flag: '🇲🇴' },
  { code: 'MRU', name: 'Ouguiya Mauritano', symbol: 'UM', flag: '🇲🇷' },
  { code: 'MUR', name: 'Rupia Mauriciana', symbol: '₨', flag: '🇲🇺' },
  { code: 'MVR', name: 'Rufiyaa Maldiva', symbol: 'Rf', flag: '🇲🇻' },
  { code: 'MWK', name: 'Kwacha Malauiano', symbol: 'MK', flag: '🇲🇼' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
  { code: 'MYR', name: 'Ringgit Malaio', symbol: 'RM', flag: '🇲🇾' },
  { code: 'MZN', name: 'Metical Moçambicano', symbol: 'MT', flag: '🇲🇿' },
  { code: 'NAD', name: 'Dólar Namibiano', symbol: '$', flag: '🇳🇦' },
  { code: 'NGN', name: 'Naira Nigeriana', symbol: '₦', flag: '🇳🇬' },
  { code: 'NIO', name: 'Córdoba Nicaraguense', symbol: 'C$', flag: '🇳🇮' },
  { code: 'NOK', name: 'Coroa Norueguesa', symbol: 'kr', flag: '🇳🇴' },
  { code: 'NPR', name: 'Rupia Nepalesa', symbol: '₨', flag: '🇳🇵' },
  { code: 'NZD', name: 'Dólar Neozelandês', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'OMR', name: 'Rial Omanense', symbol: 'ر.ع.', flag: '🇴🇲' },
  { code: 'PAB', name: 'Balboa Panamenho', symbol: 'B/.', flag: '🇵🇦' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪' },
  { code: 'PGK', name: 'Kina Papua-Nova Guiné', symbol: 'K', flag: '🇵🇬' },
  { code: 'PHP', name: 'Peso Filipino', symbol: '₱', flag: '🇵🇭' },
  { code: 'PKR', name: 'Rupia Paquistanesa', symbol: '₨', flag: '🇵🇰' },
  { code: 'PLN', name: 'Zloty Polonês', symbol: 'zł', flag: '🇵🇱' },
  { code: 'PYG', name: 'Guarani Paraguaio', symbol: '₲', flag: '🇵🇾' },
  { code: 'QAR', name: 'Rial Catarense', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'RON', name: 'Leu Romeno', symbol: 'lei', flag: '🇷🇴' },
  { code: 'RSD', name: 'Dinar Sérvio', symbol: 'дин', flag: '🇷🇸' },
  { code: 'RUB', name: 'Rublo Russo', symbol: '₽', flag: '🇷🇺' },
  { code: 'RWF', name: 'Franco Ruandês', symbol: 'Fr', flag: '🇷🇼' },
  { code: 'SAR', name: 'Riyal Saudita', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'SBD', name: 'Dólar das Ilhas Salomão', symbol: '$', flag: '🇸🇧' },
  { code: 'SCR', name: 'Rupia das Seychelles', symbol: '₨', flag: '🇸🇨' },
  { code: 'SDG', name: 'Libra Sudanesa', symbol: '£', flag: '🇸🇩' },
  { code: 'SEK', name: 'Coroa Sueca', symbol: 'kr', flag: '🇸🇪' },
  { code: 'SGD', name: 'Dólar de Singapura', symbol: 'S$', flag: '🇸🇬' },
  { code: 'SHP', name: 'Libra de Santa Helena', symbol: '£', flag: '🇸🇭' },
  { code: 'SLL', name: 'Leone de Serra Leoa', symbol: 'Le', flag: '🇸🇱' },
  { code: 'SOS', name: 'Xelim Somali', symbol: 'Sh', flag: '🇸🇴' },
  { code: 'SRD', name: 'Dólar Surinamês', symbol: '$', flag: '🇸🇷' },
  { code: 'SSP', name: 'Libra Sul-Sudanesa', symbol: '£', flag: '🇸🇸' },
  { code: 'STN', name: 'Dobra São-Tomense', symbol: 'Db', flag: '🇸🇹' },
  { code: 'SYP', name: 'Libra Síria', symbol: '£', flag: '🇸🇾' },
  { code: 'SZL', name: 'Lilangeni Suazi', symbol: 'L', flag: '🇸🇿' },
  { code: 'THB', name: 'Baht Tailandês', symbol: '฿', flag: '🇹🇭' },
  { code: 'TJS', name: 'Somoni Tajique', symbol: 'ЅМ', flag: '🇹🇯' },
  { code: 'TMT', name: 'Manat Turcomeno', symbol: 'm', flag: '🇹🇲' },
  { code: 'TND', name: 'Dinar Tunisiano', symbol: 'د.ت', flag: '🇹🇳' },
  { code: 'TOP', name: 'Pa\'anga Tonganesa', symbol: 'T$', flag: '🇹🇴' },
  { code: 'TRY', name: 'Lira Turca', symbol: '₺', flag: '🇹🇷' },
  { code: 'TTD', name: 'Dólar de Trinidad e Tobago', symbol: '$', flag: '🇹🇹' },
  { code: 'TWD', name: 'Novo Dólar Taiwanês', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'TZS', name: 'Xelim Tanzaniano', symbol: 'Sh', flag: '🇹🇿' },
  { code: 'UAH', name: 'Hryvnia Ucraniana', symbol: '₴', flag: '🇺🇦' },
  { code: 'UGX', name: 'Xelim Ugandense', symbol: 'Sh', flag: '🇺🇬' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸' },
  { code: 'UYU', name: 'Peso Uruguaio', symbol: '$', flag: '🇺🇾' },
  { code: 'UZS', name: 'Som Uzbeque', symbol: 'so\'m', flag: '🇺🇿' },
  { code: 'VES', name: 'Bolívar Venezuelano', symbol: 'Bs.', flag: '🇻🇪' },
  { code: 'VND', name: 'Dong Vietnamita', symbol: '₫', flag: '🇻🇳' },
  { code: 'VUV', name: 'Vatu de Vanuatu', symbol: 'Vt', flag: '🇻🇺' },
  { code: 'WST', name: 'Tala Samoano', symbol: 'T', flag: '🇼🇸' },
  { code: 'XAF', name: 'Franco CFA Central', symbol: 'Fr', flag: '🌍' },
  { code: 'XCD', name: 'Dólar do Caribe Oriental', symbol: '$', flag: '🏝️' },
  { code: 'XOF', name: 'Franco CFA Ocidental', symbol: 'Fr', flag: '🌍' },
  { code: 'XPF', name: 'Franco CFP', symbol: 'Fr', flag: '🏝️' },
  { code: 'YER', name: 'Rial Iemenita', symbol: '﷼', flag: '🇾🇪' },
  { code: 'ZAR', name: 'Rand Sul-Africano', symbol: 'R', flag: '🇿🇦' },
  { code: 'ZMW', name: 'Kwacha Zambiano', symbol: 'ZK', flag: '🇿🇲' },
  { code: 'ZWL', name: 'Dólar do Zimbábue', symbol: '$', flag: '🇿🇼' },
];

