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
  { code: 'AED', name: 'Dirham dos Emirados', flag: '🇦🇪' },
  { code: 'AFN', name: 'Afghani do Afeganistão', flag: '🇦🇫' },
  { code: 'ALL', name: 'Lek Albanês', flag: '🇦🇱' },
  { code: 'AMD', name: 'Dram Armênio', flag: '🇦🇲' },
  { code: 'ANG', name: 'Florim das Antilhas', flag: '🇳🇱' },
  { code: 'AOA', name: 'Kwanza Angolano', flag: '🇦🇴' },
  { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷' },
  { code: 'AUD', name: 'Dólar Australiano', flag: '🇦🇺' },
  { code: 'AWG', name: 'Florim de Aruba', flag: '🇦🇼' },
  { code: 'AZN', name: 'Manat Azeri', flag: '🇦🇿' },
  { code: 'BAM', name: 'Marco Conversível', flag: '🇧🇦' },
  { code: 'BBD', name: 'Dólar de Barbados', flag: '🇧🇧' },
  { code: 'BDT', name: 'Taka de Bangladesh', flag: '🇧🇩' },
  { code: 'BGN', name: 'Lev Búlgaro', flag: '🇧🇬' },
  { code: 'BHD', name: 'Dinar do Bahrein', flag: '🇧🇭' },
  { code: 'BIF', name: 'Franco do Burundi', flag: '🇧🇮' },
  { code: 'BMD', name: 'Dólar das Bermudas', flag: '🇧🇲' },
  { code: 'BND', name: 'Dólar de Brunei', flag: '🇧🇳' },
  { code: 'BOB', name: 'Boliviano', flag: '🇧🇴' },
  { code: 'BRL', name: 'Real Brasileiro', flag: '🇧🇷' },
  { code: 'BSD', name: 'Dólar das Bahamas', flag: '🇧🇸' },
  { code: 'BTN', name: 'Ngultrum do Butão', flag: '🇧🇹' },
  { code: 'BWP', name: 'Pula de Botswana', flag: '🇧🇼' },
  { code: 'BYN', name: 'Rublo Bielorrusso', flag: '🇧🇾' },
  { code: 'BZD', name: 'Dólar de Belize', flag: '🇧🇿' },
  { code: 'CAD', name: 'Dólar Canadense', flag: '🇨🇦' },
  { code: 'CDF', name: 'Franco Congolês', flag: '🇨🇩' },
  { code: 'CHF', name: 'Franco Suíço', flag: '🇨🇭' },
  { code: 'CLP', name: 'Peso Chileno', flag: '🇨🇱' },
  { code: 'CNY', name: 'Yuan Chinês', flag: '🇨🇳' },
  { code: 'COP', name: 'Peso Colombiano', flag: '🇨🇴' },
  { code: 'CRC', name: 'Colón Costarriquenho', flag: '🇨🇷' },
  { code: 'CUP', name: 'Peso Cubano', flag: '🇨🇺' },
  { code: 'CVE', name: 'Escudo Cabo-verdiano', flag: '🇨🇻' },
  { code: 'CZK', name: 'Coroa Tcheca', flag: '🇨🇿' },
  { code: 'DJF', name: 'Franco do Djibuti', flag: '🇩🇯' },
  { code: 'DKK', name: 'Coroa Dinamarquesa', flag: '🇩🇰' },
  { code: 'DOP', name: 'Peso Dominicano', flag: '🇩🇴' },
  { code: 'DZD', name: 'Dinar Argelino', flag: '🇩🇿' },
  { code: 'EGP', name: 'Libra Egípcia', flag: '🇪🇬' },
  { code: 'ERN', name: 'Nakfa da Eritreia', flag: '🇪🇷' },
  { code: 'ETB', name: 'Birr Etíope', flag: '🇪🇹' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'FJD', name: 'Dólar de Fiji', flag: '🇫🇯' },
  { code: 'FKP', name: 'Libra das Malvinas', flag: '🇫🇰' },
  { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
  { code: 'GEL', name: 'Lari Georgiano', flag: '🇬🇪' },
  { code: 'GHS', name: 'Cedi Ganês', flag: '🇬🇭' },
  { code: 'GIP', name: 'Libra de Gibraltar', flag: '🇬🇮' },
  { code: 'GMD', name: 'Dalasi da Gâmbia', flag: '🇬🇲' },
  { code: 'GNF', name: 'Franco Guineano', flag: '🇬🇳' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', flag: '🇬🇹' },
  { code: 'GYD', name: 'Dólar Guianense', flag: '🇬🇾' },
  { code: 'HKD', name: 'Dólar de Hong Kong', flag: '🇭🇰' },
  { code: 'HNL', name: 'Lempira Hondurenha', flag: '🇭🇳' },
  { code: 'HRK', name: 'Kuna Croata', flag: '🇭🇷' },
  { code: 'HTG', name: 'Gourde Haitiano', flag: '🇭🇹' },
  { code: 'HUF', name: 'Florim Húngaro', flag: '🇭🇺' },
  { code: 'IDR', name: 'Rupia Indonésia', flag: '🇮🇩' },
  { code: 'ILS', name: 'Shekel Israelense', flag: '🇮🇱' },
  { code: 'INR', name: 'Rupia Indiana', flag: '🇮🇳' },
  { code: 'IQD', name: 'Dinar Iraquiano', flag: '🇮🇶' },
  { code: 'IRR', name: 'Rial Iraniano', flag: '🇮🇷' },
  { code: 'ISK', name: 'Coroa Islandesa', flag: '🇮🇸' },
  { code: 'JMD', name: 'Dólar Jamaicano', flag: '🇯🇲' },
  { code: 'JOD', name: 'Dinar Jordaniano', flag: '🇯🇴' },
  { code: 'JPY', name: 'Iene Japonês', flag: '🇯🇵' },
  { code: 'KES', name: 'Xelim Queniano', flag: '🇰🇪' },
  { code: 'KGS', name: 'Som Quirguiz', flag: '🇰🇬' },
  { code: 'KHR', name: 'Riel Cambojano', flag: '🇰🇭' },
  { code: 'KMF', name: 'Franco Comorense', flag: '🇰🇲' },
  { code: 'KRW', name: 'Won Sul-Coreano', flag: '🇰🇷' },
  { code: 'KWD', name: 'Dinar Kuwaitiano', flag: '🇰🇼' },
  { code: 'KYD', name: 'Dólar das Ilhas Cayman', flag: '🇰🇾' },
  { code: 'KZT', name: 'Tenge Cazaque', flag: '🇰🇿' },
  { code: 'LAK', name: 'Kip Laosiano', flag: '🇱🇦' },
  { code: 'LBP', name: 'Libra Libanesa', flag: '🇱🇧' },
  { code: 'LKR', name: 'Rupia do Sri Lanka', flag: '🇱🇰' },
  { code: 'LRD', name: 'Dólar Liberiano', flag: '🇱🇷' },
  { code: 'LSL', name: 'Loti do Lesoto', flag: '🇱🇸' },
  { code: 'LYD', name: 'Dinar Líbio', flag: '🇱🇾' },
  { code: 'MAD', name: 'Dirham Marroquino', flag: '🇲🇦' },
  { code: 'MDL', name: 'Leu Moldavo', flag: '🇲🇩' },
  { code: 'MGA', name: 'Ariary Malgaxe', flag: '🇲🇬' },
  { code: 'MKD', name: 'Dinar Macedônio', flag: '🇲🇰' },
  { code: 'MMK', name: 'Quiate de Mianmar', flag: '🇲🇲' },
  { code: 'MNT', name: 'Tugrik Mongol', flag: '🇲🇳' },
  { code: 'MOP', name: 'Pataca de Macau', flag: '🇲🇴' },
  { code: 'MRU', name: 'Ouguiya Mauritano', flag: '🇲🇷' },
  { code: 'MUR', name: 'Rupia Mauriciana', flag: '🇲🇺' },
  { code: 'MVR', name: 'Rufiyaa Maldiva', flag: '🇲🇻' },
  { code: 'MWK', name: 'Kwacha Malauiano', flag: '🇲🇼' },
  { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽' },
  { code: 'MYR', name: 'Ringgit Malaio', flag: '🇲🇾' },
  { code: 'MZN', name: 'Metical Moçambicano', flag: '🇲🇿' },
  { code: 'NAD', name: 'Dólar Namibiano', flag: '🇳🇦' },
  { code: 'NGN', name: 'Naira Nigeriana', flag: '🇳🇬' },
  { code: 'NIO', name: 'Córdoba Nicaraguense', flag: '🇳🇮' },
  { code: 'NOK', name: 'Coroa Norueguesa', flag: '🇳🇴' },
  { code: 'NPR', name: 'Rupia Nepalesa', flag: '🇳🇵' },
  { code: 'NZD', name: 'Dólar Neozelandês', flag: '🇳🇿' },
  { code: 'OMR', name: 'Rial Omanense', flag: '🇴🇲' },
  { code: 'PAB', name: 'Balboa Panamenho', flag: '🇵🇦' },
  { code: 'PEN', name: 'Sol Peruano', flag: '🇵🇪' },
  { code: 'PGK', name: 'Kina Papua-Nova Guiné', flag: '🇵🇬' },
  { code: 'PHP', name: 'Peso Filipino', flag: '🇵🇭' },
  { code: 'PKR', name: 'Rupia Paquistanesa', flag: '🇵🇰' },
  { code: 'PLN', name: 'Zloty Polonês', flag: '🇵🇱' },
  { code: 'PYG', name: 'Guarani Paraguaio', flag: '🇵🇾' },
  { code: 'QAR', name: 'Rial Catarense', flag: '🇶🇦' },
  { code: 'RON', name: 'Leu Romeno', flag: '🇷🇴' },
  { code: 'RSD', name: 'Dinar Sérvio', flag: '🇷🇸' },
  { code: 'RUB', name: 'Rublo Russo', flag: '🇷🇺' },
  { code: 'RWF', name: 'Franco Ruandês', flag: '🇷🇼' },
  { code: 'SAR', name: 'Riyal Saudita', flag: '🇸🇦' },
  { code: 'SBD', name: 'Dólar das Ilhas Salomão', flag: '🇸🇧' },
  { code: 'SCR', name: 'Rupia das Seychelles', flag: '🇸🇨' },
  { code: 'SDG', name: 'Libra Sudanesa', flag: '🇸🇩' },
  { code: 'SEK', name: 'Coroa Sueca', flag: '🇸🇪' },
  { code: 'SGD', name: 'Dólar de Singapura', flag: '🇸🇬' },
  { code: 'SHP', name: 'Libra de Santa Helena', flag: '🇸🇭' },
  { code: 'SLL', name: 'Leone de Serra Leoa', flag: '🇸🇱' },
  { code: 'SOS', name: 'Xelim Somali', flag: '🇸🇴' },
  { code: 'SRD', name: 'Dólar Surinamês', flag: '🇸🇷' },
  { code: 'SSP', name: 'Libra Sul-Sudanesa', flag: '🇸🇸' },
  { code: 'STN', name: 'Dobra São-Tomense', flag: '🇸🇹' },
  { code: 'SYP', name: 'Libra Síria', flag: '🇸🇾' },
  { code: 'SZL', name: 'Lilangeni Suazi', flag: '🇸🇿' },
  { code: 'THB', name: 'Baht Tailandês', flag: '🇹🇭' },
  { code: 'TJS', name: 'Somoni Tajique', flag: '🇹🇯' },
  { code: 'TMT', name: 'Manat Turcomeno', flag: '🇹🇲' },
  { code: 'TND', name: 'Dinar Tunisiano', flag: '🇹🇳' },
  { code: 'TOP', name: 'Pa\'anga Tonganesa', flag: '🇹🇴' },
  { code: 'TRY', name: 'Lira Turca', flag: '🇹🇷' },
  { code: 'TTD', name: 'Dólar de Trinidad e Tobago', flag: '🇹🇹' },
  { code: 'TWD', name: 'Novo Dólar Taiwanês', flag: '🇹🇼' },
  { code: 'TZS', name: 'Xelim Tanzaniano', flag: '🇹🇿' },
  { code: 'UAH', name: 'Hryvnia Ucraniana', flag: '🇺🇦' },
  { code: 'UGX', name: 'Xelim Ugandense', flag: '🇺🇬' },
  { code: 'USD', name: 'Dólar Americano', flag: '🇺🇸' },
  { code: 'UYU', name: 'Peso Uruguaio', flag: '🇺🇾' },
  { code: 'UZS', name: 'Som Uzbeque', flag: '🇺🇿' },
  { code: 'VES', name: 'Bolívar Venezuelano', flag: '🇻🇪' },
  { code: 'VND', name: 'Dong Vietnamita', flag: '🇻🇳' },
  { code: 'VUV', name: 'Vatu de Vanuatu', flag: '🇻🇺' },
  { code: 'WST', name: 'Tala Samoano', flag: '🇼🇸' },
  { code: 'XAF', name: 'Franco CFA Central', flag: '🌍' },
  { code: 'XCD', name: 'Dólar do Caribe Oriental', flag: '🏝️' },
  { code: 'XOF', name: 'Franco CFA Ocidental', flag: '🌍' },
  { code: 'XPF', name: 'Franco CFP', flag: '🏝️' },
  { code: 'YER', name: 'Rial Iemenita', flag: '🇾🇪' },
  { code: 'ZAR', name: 'Rand Sul-Africano', flag: '🇿🇦' },
  { code: 'ZMW', name: 'Kwacha Zambiano', flag: '🇿🇲' },
  { code: 'ZWL', name: 'Dólar do Zimbábue', flag: '🇿🇼' },
];

