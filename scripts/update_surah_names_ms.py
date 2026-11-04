"""
Add official Malaysian (JAKIM / DBP) Malay transliteration and translations to data/surahs.json
"""
import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
SURAHS_FILE = ROOT_DIR / "data" / "surahs.json"

SURAH_MS_DATA = {
    1: ("Al-Fatihah", "Pembukaan"),
    2: ("Al-Baqarah", "Lembu Betina"),
    3: ("Ali 'Imran", "Keluarga Imran"),
    4: ("An-Nisa'", "Wanita"),
    5: ("Al-Ma'idah", "Hidangan"),
    6: ("Al-An'am", "Binatang Ternakan"),
    7: ("Al-A'raf", "Tempat Tertinggi"),
    8: ("Al-Anfal", "Harta Rampasan Perang"),
    9: ("At-Tawbah", "Pengampunan"),
    10: ("Yunus", "Nabi Yunus"),
    11: ("Hud", "Nabi Hud"),
    12: ("Yusuf", "Nabi Yusuf"),
    13: ("Ar-Ra'd", "Guruh"),
    14: ("Ibrahim", "Nabi Ibrahim"),
    15: ("Al-Hijr", "Kawasan Berbatu"),
    16: ("An-Nahl", "Lebah"),
    17: ("Al-Isra'", "Perjalanan Malam"),
    18: ("Al-Kahf", "Gua"),
    19: ("Maryam", "Siti Maryam"),
    20: ("Taha", "Ta Ha"),
    21: ("Al-Anbiya'", "Para Nabi"),
    22: ("Al-Hajj", "Haji"),
    23: ("Al-Mu'minun", "Golongan yang Beriman"),
    24: ("An-Nur", "Cahaya"),
    25: ("Al-Furqan", "Pembeza Kebenaran dan Kebatilan"),
    26: ("Asy-Syu'ara'", "Para Penyair"),
    27: ("An-Naml", "Semut"),
    28: ("Al-Qasas", "Kisah-Kisah"),
    29: ("Al-'Ankabut", "Labah-Labah"),
    30: ("Ar-Rum", "Bangsa Rom"),
    31: ("Luqman", "Luqman"),
    32: ("As-Sajdah", "Sujud"),
    33: ("Al-Ahzab", "Golongan yang Bersekutu"),
    34: ("Saba'", "Kaum Saba'"),
    35: ("Fatir", "Pencipta"),
    36: ("Ya Sin", "Ya Sin"),
    37: ("As-Saffat", "Yang Berbaris Teratur"),
    38: ("Sad", "Sad"),
    39: ("Az-Zumar", "Rombongan"),
    40: ("Ghafir", "Maha Pengampun"),
    41: ("Fussilat", "Yang Dijelaskan"),
    42: ("Asy-Syura", "Musyawarah"),
    43: ("Az-Zukhruf", "Perhiasan Emas"),
    44: ("Ad-Dukhan", "Asap / Kabus"),
    45: ("Al-Jatsiyah", "Yang Berlutut"),
    46: ("Al-Ahqaf", "Bukit-Bukit Pasir"),
    47: ("Muhammad", "Nabi Muhammad"),
    48: ("Al-Fath", "Kemenangan"),
    49: ("Al-Hujurat", "Bilik-Bilik Kediaman"),
    50: ("Qaf", "Qaf"),
    51: ("Az-Zariyat", "Angin yang Menerbangkan"),
    52: ("At-Tur", "Bukit Tur"),
    53: ("An-Najm", "Bintang"),
    54: ("Al-Qamar", "Bulan"),
    55: ("Ar-Rahman", "Maha Pemurah"),
    56: ("Al-Waqi'ah", "Peristiwa yang Pasti Berlaku"),
    57: ("Al-Hadid", "Besi"),
    58: ("Al-Mujadilah", "Perempuan yang Membantah"),
    59: ("Al-Hasyr", "Pengusiran"),
    60: ("Al-Mumtahanah", "Perempuan yang Diuji"),
    61: ("As-Saff", "Barisan"),
    62: ("Al-Jumu'ah", "Hari Jumaat"),
    63: ("Al-Munafiqun", "Golongan Munafik"),
    64: ("At-Taghabun", "Hari Dinampakkan Kesalahan"),
    65: ("At-Talaq", "Perceraian"),
    66: ("At-Tahrim", "Mengharamkan"),
    67: ("Al-Mulk", "Kerajaan"),
    68: ("Al-Qalam", "Pena"),
    69: ("Al-Haqqah", "Hari Kiamat yang Sebenar"),
    70: ("Al-Ma'arij", "Tempat-Tempat Naik"),
    71: ("Nuh", "Nabi Nuh"),
    72: ("Al-Jinn", "Jin"),
    73: ("Al-Muzzammil", "Orang yang Berselimut"),
    74: ("Al-Muddassir", "Orang yang Berkemul"),
    75: ("Al-Qiyamah", "Hari Kiamat"),
    76: ("Al-Insan", "Manusia"),
    77: ("Al-Mursalat", "Malaikat yang Diutus"),
    78: ("An-Naba'", "Berita Besar"),
    79: ("An-Nazi'at", "Malaikat yang Mencabut"),
    80: ("'Abasa", "Dia Bermasam Muka"),
    81: ("At-Takwir", "Menggulung"),
    82: ("Al-Infitar", "Terbelah"),
    83: ("Al-Mutaffifin", "Golongan yang Curang"),
    84: ("Al-Insyiqaq", "Terbelah"),
    85: ("Al-Buruj", "Gugusan Bintang"),
    86: ("At-Tariq", "Pengunjung Malam"),
    87: ("Al-A'la", "Yang Maha Tinggi"),
    88: ("Al-Ghasyiyah", "Hari Pembalasan yang Menyelubungi"),
    89: ("Al-Fajr", "Fajar"),
    90: ("Al-Balad", "Negeri"),
    91: ("Asy-Syams", "Matahari"),
    92: ("Al-Lail", "Malam"),
    93: ("Ad-Duha", "Waktu Dhuha"),
    94: ("Al-Insyirah", "Kelapangan"),
    95: ("At-Tin", "Buah Tin"),
    96: ("Al-'Alaq", "Segumpal Darah"),
    97: ("Al-Qadr", "Kemuliaan"),
    98: ("Al-Bayyinah", "Bukti yang Nyata"),
    99: ("Az-Zalzalah", "Kegoncangan"),
    100: ("Al-'Adiyat", "Kuda Perang yang Berlari Kencang"),
    101: ("Al-Qari'ah", "Hari Kiamat yang Menggemparkan"),
    102: ("At-Takatsur", "Bermegah-megahan"),
    103: ("Al-'Asr", "Masa"),
    104: ("Al-Humazah", "Pengumpat"),
    105: ("Al-Fil", "Gajah"),
    106: ("Quraisy", "Kaum Quraisy"),
    107: ("Al-Ma'un", "Barangan Berguna"),
    108: ("Al-Kautsar", "Nikmat yang Melimpah"),
    109: ("Al-Kafirun", "Golongan Kafir"),
    110: ("An-Nasr", "Pertolongan"),
    111: ("Al-Masad", "Tali Sabut"),
    112: ("Al-Ikhlas", "Memurnikan Keesaan Allah"),
    113: ("Al-Falaq", "Waktu Subuh"),
    114: ("An-Nas", "Manusia")
}

def main():
    with open(SURAHS_FILE, "r", encoding="utf-8") as f:
        surahs = json.load(f)

    assert len(surahs) == 114, f"Expected 114 surahs, got {len(surahs)}"

    for s in surahs:
        num = s["number"]
        if num in SURAH_MS_DATA:
            name_ms, trans_ms = SURAH_MS_DATA[num]
            s["name_ms"] = name_ms
            s["translation_ms"] = trans_ms
        else:
            print(f"Warning: Surah {num} missing in MS data")

    with open(SURAHS_FILE, "w", encoding="utf-8") as f:
        json.dump(surahs, f, ensure_ascii=False, indent=2)

    print("Successfully updated data/surahs.json with 114 Malay names and translations!")

if __name__ == "__main__":
    main()
