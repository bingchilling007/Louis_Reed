<?php
/**
 * contact.php — Louis L. Reed Contact Form Handler
 * Processes POST submissions, sends email via PHP mail(), returns JSON.
 */

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

header('Content-Type: application/json');

// ── Helper: sanitize input ───────────────────────────────────────────────────
function clean(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

// ── Collect & sanitize fields ────────────────────────────────────────────────
$name         = clean($_POST['name']         ?? '');
$organization = clean($_POST['organization'] ?? '');
$email        = trim($_POST['email']         ?? '');
$inquiry_type = clean($_POST['inquiry_type'] ?? '');
$message      = clean($_POST['message']      ?? '');

// ── Validation ───────────────────────────────────────────────────────────────
$errors = [];

if ($name === '') {
    $errors[] = 'Name is required.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}

$allowed_types = ['consulting', 'speaking', 'film', 'book', 'other'];
if ($inquiry_type === '' || !in_array($inquiry_type, $allowed_types, true)) {
    $errors[] = 'Please select a valid inquiry type.';
}

if ($message === '') {
    $errors[] = 'Message is required.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ── Friendly label for inquiry type ──────────────────────────────────────────
$type_labels = [
    'consulting' => 'Corporate Social Impact Consulting',
    'speaking'   => 'Keynote Speaking',
    'film'       => 'Film & Documentary Partnership',
    'book'       => "Deuce's First Step — Bulk Order",
    'other'      => 'Other / General Inquiry',
];
$inquiry_label = $type_labels[$inquiry_type] ?? $inquiry_type;

// ── Build email ───────────────────────────────────────────────────────────────
$to      = 'lreed@louislreed.org';
$subject = "New Inquiry from {$name}" . ($organization ? " ({$organization})" : '');

$body  = "You have received a new inquiry via louislreed.org.\n";
$body .= str_repeat('-', 60) . "\n\n";
$body .= "Name:         {$name}\n";
$body .= "Organization: " . ($organization ?: '—') . "\n";
$body .= "Email:        {$email}\n";
$body .= "Inquiry Type: {$inquiry_label}\n\n";
$body .= "Message:\n{$message}\n\n";
$body .= str_repeat('-', 60) . "\n";
$body .= "Reply directly to this email to contact {$name}.\n";

// Headers: set From, Reply-To, and MIME type
$headers  = "From: Louis Reed Website <noreply@louislreed.org>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// ── Send ──────────────────────────────────────────────────────────────────────
$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Your message has been sent.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sorry, your message could not be sent. Please try emailing directly at lreed@louislreed.org.']);
}
