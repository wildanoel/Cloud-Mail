// ============================================================
// PATCH: Indonesian Translation (Bahasa Indonesia)
// ============================================================
// Replace mail-worker/src/i18n/zh.js with this file
// OR add this as a new language option in i18n.js
// ============================================================

const id = {
	// Auth
	IncorrectPwd: 'Email atau password salah',
	loginFailed: 'Email atau password salah',
	notExistUser: 'Email atau password salah',
	isDelUser: 'Akun ini sudah tidak aktif',
	isBanUser: 'Akun ini sudah dibanned',
	authExpired: 'Sesi login sudah habis, silakan login ulang',
	unauthorized: 'Akses ditolak',
	emailAndPwdEmpty: 'Email dan password tidak boleh kosong',
	notEmail: 'Format email tidak valid',
	notEmailDomain: 'Domain email tidak diizinkan',

	// Registration
	regDisabled: 'Pendaftaran sedang ditutup',
	isRegAccount: 'Email ini sudah terdaftar',
	emptyRegKey: 'Kode invite tidak boleh kosong',
	notExistRegKey: 'Kode invite tidak valid',
	noRegKeyTotal: 'Kode invite sudah habis',
	regKeyExpire: 'Kode invite sudah expired',
	banEmailPrefix: 'Nama email mengandung karakter yang tidak diizinkan',
	minEmailPrefix: 'Nama email minimal {{msg}} karakter',
	emailLengthLimit: 'Nama email maksimal 64 karakter',
	pwdLengthLimit: 'Password maksimal 30 karakter',
	pwdMinLength: 'Password minimal 6 karakter',
	noDomainPermReg: 'Kamu tidak punya izin untuk mendaftar di domain ini',
	noDomainPermRegKey: 'Kode invite kamu tidak punya izin untuk domain ini',

	// Email
	addAccountDisabled: 'Fitur tambah email sudah ditutup',
	emptyEmail: 'Email tidak boleh kosong',
	notExistDomain: 'Domain email tidak ada',
	isDelAccount: 'Email ini sudah dihapus',
	accountLimit: 'Batas jumlah email sudah tercapai',
	delMyAccount: 'Tidak bisa menghapus email sendiri',
	noUserAccount: 'Email ini bukan milik kamu',
	usernameLengthLimit: 'Nama username terlalu panjang',
	noOsSendPic: 'Storage belum dikonfigurasi, tidak bisa kirim gambar',
	noOsDomainSendAtt: 'Domain storage belum dikonfigurasi, tidak bisa kirim lampiran',
	noOsSendAtt: 'Storage belum dikonfigurasi, tidak bisa kirim lampiran',
	disabledSend: 'Fitur kirim email sudah dimatikan',
	daySendLimit: 'Batas kirim email hari ini sudah tercapai',
	totalSendLimit: 'Batas kirim email sudah tercapai',
	daySendLack: 'Sisa kuota kirim hari ini tidak cukup',
	totalSendLack: 'Sisa kuota kirim tidak cukup',
	senderAccountNotExist: 'Email pengirim tidak ditemukan',
	noResendToken: 'Resend belum dikonfigurasi, hanya bisa kirim ke email internal',
	sendEmailNotCurUser: 'Email pengirim bukan milik kamu',
	notExistEmailReply: 'Email yang mau dibalas tidak ditemukan',
	imageAttLimit: 'Gambar maksimal 10',
	attLimit: 'Lampiran maksimal 10',

	// Permissions
	bannedSend: 'Kamu tidak punya izin kirim email',
	onlyInternalSend: 'Akses ditolak, hanya bisa kirim ke email internal',
	noDomainPermAdd: 'Kamu tidak punya izin untuk menambah email di domain ini',
	noDomainPermSend: 'Kamu tidak punya izin untuk mengirim dari domain ini',
	publicTokenFail: 'Token publik tidak valid',
	notAdmin: 'Email ini bukan akun admin',
	emailExistDatabase: 'Ada email yang sudah ada di database',
	notConfigOss: 'Storage object belum dikonfigurasi',

	// Roles & Keys
	roleNotExist: 'Role tidak ditemukan',
	emptyRoleName: 'Nama role tidak boleh kosong',
	roleNameExist: 'Nama role sudah ada',
	delDefRole: 'Role default tidak bisa dihapus',
	regKeyUseCount: 'Jumlah penggunaan tidak boleh kosong',
	emptyRegKeyExpire: 'Masa berlaku tidak boleh kosong',
	isExistRegKye: 'Kode invite sudah ada',
	noOsUpBack: 'Storage belum dikonfigurasi, tidak bisa upload background',
	noOsDomainUpBack: 'Domain storage belum dikonfigurasi, tidak bisa upload background',
	starNotExistEmail: 'Email yang di-star tidak ditemukan',
	emptyBotToken: 'Verifikasi captcha diperlukan',
	botVerifyFail: 'Verifikasi captcha gagal, silakan coba lagi',

	// Config
	notJsonDomain: 'Environment variable domain harus bertipe JSON',
	noDomainVariable: 'Environment variable domain tidak boleh kosong',

	// Permissions labels
	perms: {
		// New English DB labels
		"Mail": "Email",
		"Delete email": "Hapus Email",
		"Send email": "Kirim Email",
		"Personal settings": "Pengaturan Pribadi",
		"Delete my account": "Hapus Akun",
		"User management": "Daftar Pengguna",
		"View users": "Lihat Pengguna",
		"Change password": "Ubah Password",
		"Change status": "Ubah Status",
		"Change permissions": "Ubah Permission",
		"Delete user": "Hapus Pengguna",
		"Star users": "Favorit Pengguna",
		"Access control": "Kontrol Akses",
		"View roles": "Lihat Role",
		"Edit role": "Ubah Role",
		"Delete role": "Hapus Role",
		"System settings": "Pengaturan Sistem",
		"View settings": "Lihat Pengaturan",
		"Edit settings": "Ubah Pengaturan",
		"Mailbox sidebar": "Sidebar Email",
		"View mailboxes": "Lihat Email",
		"Add mailbox": "Tambah Email",
		"Delete mailbox": "Hapus Email",
		"Add user": "Tambah Pengguna",
		"Reset send quota": "Reset Kuota Kirim",
		"Mail list": "Semua Email",
		"View all mail": "Lihat Email",
		"Delete all mail": "Hapus Email",
		"Add role": "Tambah Role",
		"Analytics": "Analitik",
		"View analytics": "Lihat Data",
		"Invite codes": "Kode Invite",
		"View invite codes": "Lihat Kode",
		"Add invite code": "Tambah Kode",
		"Delete invite code": "Hapus Kode",
		// Legacy Chinese keys (compat)
	}

}

export default id
