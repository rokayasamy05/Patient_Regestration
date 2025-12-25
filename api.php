<?php
header("Content-Type: application/json; charset=UTF-8");

$serverName = "localhost\\SQLEXPRESS";
$connectionInfo = array(
    "Database" => "Patient_Regestration",
    "UID" => "sa",
    "PWD" => "R@qia2025#Db!",
    "CharacterSet" => "UTF-8"
);

$conn = sqlsrv_connect($serverName, $connectionInfo);

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "فشل الاتصال بالقاعدة"]);
    exit;
}

$action = $_GET['action'] ?? '';

// --- البحث ---
if ($action == 'search') {
    $p_num = $_GET['p_number'] ?? '';
    $sql = "SELECT * FROM patients WHERE p_number = ?";
    $stmt = sqlsrv_query($conn, $sql, array($p_num));

    if ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        if ($row['p_birthday'] instanceof DateTime) {
            $row['p_birthday'] = $row['p_birthday']->format('Y-m-d');
        }
        echo json_encode(["status" => "found", "data" => $row]);
    } else {
        echo json_encode(["status" => "not_found"]);
    }
}

// --- التسجيل ---
if ($action == 'register') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO patients (p_number, p_name, p_phone, p_national_id, p_adress, p_birthday) VALUES (?, ?, ?, ?, ?, ?)";
    $params = array(
        $data['p_number'], 
        $data['p_name'], 
        $data['p_phone'], 
        $data['p_national_id'], 
        $data['p_adress'], 
        ($data['p_birthday'] ?: null) 
    );
    
    $stmt = sqlsrv_query($conn, $sql, $params);
    if ($stmt) {
        echo json_encode(["status" => "success"]);
    } else {
        $errors = sqlsrv_errors();
        echo json_encode(["status" => "error", "message" => $errors[0]['message']]);
    }
}

// --- الحجز ---
if ($action == 'book') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO appointments (department, doctor, app_date, p_number) VALUES (?, ?, ?, ?)";
    $params = array($data['department'], $data['doctor'], $data['app_date'], $data['p_number']);
    
    $stmt = sqlsrv_query($conn, $sql, $params);
    if ($stmt) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}

sqlsrv_close($conn);
?>