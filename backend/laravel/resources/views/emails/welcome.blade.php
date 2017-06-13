Hello {{$user->name}},

Thanks for creating an account, please verify your email with this link: {{route('verify', $user->verification_token)}}