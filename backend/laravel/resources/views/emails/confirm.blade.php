Hello {{$user->name}},

You changed your email, please verify your email with this link: {{route('verify', $user->verification_token)}}