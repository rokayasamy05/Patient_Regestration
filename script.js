let currentPatientId = null;
let currentPatientData = null;

const doctorsData = {
    'الباطنية': ['د. أحمد محمد', 'د. سارة خالد'],
    'الجراحة': ['د. محمد حسين', 'د. فاطمة علي'],
    'العظام': ['د. علي محمود']
};
const dates = ['2025-01-20', '2025-01-21', '2025-01-22'];

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goBackFromAppointment() {
    if (currentPatientData) showScreen('patient-details-screen');
    else showScreen('registration-screen');
}

// 1. البحث
async function searchPatient() {
    const pNum = document.getElementById('patient-id-search').value.trim();
    if (!pNum) return alert("أدخل رقم الملف");

    try {
        const res = await fetch(`api.php?action=search&p_number=${pNum}`);
        const result = await res.json();
        const resultsDiv = document.getElementById('search-results');

        if (result.status === "found") {
            currentPatientId = result.data.p_number;
            currentPatientData = result.data;
            resultsDiv.innerHTML = `
                <div class="patient-status">
                    <h3>المريض مسجل مسبقاً: ${result.data.p_name}</h3>
                    <button class="action-link" onclick="showDetails()">عرض التفاصيل </button>
                </div>`;
        } else {
            resultsDiv.innerHTML = `
                <div class="patient-status">
                    <h3>المريض غير مسجل مسبقاً</h3>
                    <button class="action-link" onclick="openReg('${pNum}')">تسجيل مريض جديد</button>
                </div>`;
        }
    } catch (e) { alert("خطأ في الاتصال بالسيرفر"); }
}

function showDetails() {
    document.getElementById('detail-name').textContent = currentPatientData.p_name;
    document.getElementById('detail-patient-id').textContent = currentPatientData.p_number;
    document.getElementById('detail-national').textContent = currentPatientData.p_national_id || 'غير مسجل';
    document.getElementById('detail-phone').textContent = currentPatientData.p_phone;
    document.getElementById('detail-address').textContent = currentPatientData.p_adress || 'غير مسجل';
    document.getElementById('detail-birthday').textContent = currentPatientData.p_birthday || 'غير مسجل';
    showScreen('patient-details-screen');
}

function openReg(n) {
    document.getElementById('patient-id-input').value = n;
    showScreen('registration-screen');
}

// 2. التسجيل
document.getElementById('registration-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        p_number: document.getElementById('patient-id-input').value,
        p_name: document.getElementById('full-name').value,
        p_phone: document.getElementById('phone').value,
        p_national_id: document.getElementById('national-id').value,
        p_adress: document.getElementById('address').value,
        p_birthday: document.getElementById('birthday').value
    };

    const res = await fetch('api.php?action=register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.status === "success") {
        currentPatientId = data.p_number;
        currentPatientData = data;
        showScreen('appointment-screen');
    } else {
        alert("فشل التسجيل: " + (result.message || "تأكد من صحة البيانات"));
    }
};

// 3. الحجز
document.getElementById('appointment-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        p_number: currentPatientId,
        department: document.getElementById('department').value,
        doctor: document.getElementById('doctor').value,
        app_date: document.getElementById('appointment-date').value
    };

    const res = await fetch('api.php?action=book', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.status === "success") {
        document.getElementById('appointment-form').style.display = 'none';
        document.getElementById('appointment-success').style.display = 'block';
    }
};

function updateDoctors() {
    const d = document.getElementById('department').value;
    const s = document.getElementById('doctor');
    s.innerHTML = '<option value="">اختر الطبيب</option>';
    s.disabled = !d;
    if(d) doctorsData[d].forEach(doc => s.add(new Option(doc, doc)));
}

function updateDates() {
    const s = document.getElementById('appointment-date');
    s.innerHTML = '<option value="">اختر التاريخ</option>';
    s.disabled = false;
    dates.forEach(date => s.add(new Option(date, date)));
}