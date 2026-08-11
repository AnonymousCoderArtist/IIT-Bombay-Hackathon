# Smart Campus — Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ OTP : "verifies via"
    USER ||--o| SETTINGS : "has"
    USER ||--o{ ATTENDANCE_SESSION : "teaches (faculty)"
    USER ||--o{ ATTENDANCE_RECORD : "marks (student)"
    ATTENDANCE_SESSION ||--o{ ATTENDANCE_RECORD : "contains"
    USER ||--o{ ASSIGNMENT : "publishes (faculty)"
    ASSIGNMENT ||--o{ SUBMISSION : "receives"
    USER ||--o{ SUBMISSION : "submits (student)"
    USER ||--o{ EVENT : "organizes"
    EVENT ||--o{ EVENT_REGISTRATION : "has"
    USER ||--o{ EVENT_REGISTRATION : "registers (student)"
    PLACEMENT ||--o{ APPLICATION : "receives"
    USER ||--o{ APPLICATION : "applies (student)"
    CLUB }o--o{ USER : "members"
    USER ||--o{ NOTICE : "authors"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ ACTIVITY_LOG : "triggers"

    USER {
        ObjectId id PK
        string name
        string email UK
        string passwordHash
        enum role "student|faculty|coordinator|admin"
        enum status "pending|active|blocked"
        boolean emailVerified
        string department
        array subjects
        date lastLoginAt
    }

    OTP {
        ObjectId id PK
        string email
        string code
        enum purpose "verify_email|reset_password"
        date expiresAt
        boolean consumed
    }

    SETTINGS {
        ObjectId id PK
        ObjectId userId FK
        string theme
        boolean emailOptIn
        object notificationPrefs
    }

    ATTENDANCE_SESSION {
        ObjectId id PK
        ObjectId facultyId FK
        string subject
        date date
    }

    ATTENDANCE_RECORD {
        ObjectId id PK
        ObjectId sessionId FK
        ObjectId studentId FK
        enum status "present|absent"
    }

    ASSIGNMENT {
        ObjectId id PK
        ObjectId facultyId FK
        string department
        string title
        string description
        date deadline
        string rubric
        boolean published
    }

    SUBMISSION {
        ObjectId id PK
        ObjectId assignmentId FK
        ObjectId studentId FK
        string content
        array files
        number score
        string feedback
        enum status "submitted|graded"
    }

    EVENT {
        ObjectId id PK
        ObjectId organizerId FK
        string title
        string description
        date date
        string venue
        number capacity
        date registrationDeadline
        enum status "upcoming|ongoing|completed|cancelled"
    }

    EVENT_REGISTRATION {
        ObjectId id PK
        ObjectId eventId FK
        ObjectId studentId FK
        string qrToken
        boolean attended
    }

    PLACEMENT {
        ObjectId id PK
        string company
        string role
        string description
        string ctc
        string eligibility
        date deadline
        enum status "open|closed"
    }

    APPLICATION {
        ObjectId id PK
        ObjectId placementId FK
        ObjectId studentId FK
        enum status "applied|shortlisted|rejected|accepted"
        date appliedAt
    }

    CLUB {
        ObjectId id PK
        string name
        string description
        ObjectId coordinatorId FK
        array members FK
    }

    NOTICE {
        ObjectId id PK
        ObjectId authorId FK
        string title
        string content
        string category
    }

    NOTIFICATION {
        ObjectId id PK
        ObjectId userId FK
        string title
        string message
        string type
        boolean read
    }

    ACTIVITY_LOG {
        ObjectId id PK
        ObjectId userId FK
        string action
        string targetResource
    }
```

## Relationship notes

- A `User` maps to one of four roles; each role exposes a different subset of the system.
- `Settings` is a 1:1 extension of `User` (unique `userId`).
- `AttendanceSession` → `AttendanceRecord` is a 1:N (one session, many student records).
- `Assignment` → `Submission` is 1:N; a student can submit once per assignment.
- `Event` → `EventRegistration` is 1:N; registrations are unique per `(event, student)`.
- `Placement` → `Application` is 1:N; one application per `(placement, student)`.
- `Club.members` is an array of `User` refs (N:M).
