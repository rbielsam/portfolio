<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TestEmailCommandTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
    }

    public function test_command_sends_test_email_to_admin_address(): void
    {
        Mail::fake();

        $this->artisan('portfolio:test-email')->assertExitCode(Command::SUCCESS);

        Mail::assertSent(\App\Mail\ContactMessageMail::class, 1);
    }

    public function test_command_fails_when_admin_email_is_not_configured(): void
    {
        Mail::fake();
        config(['contact.admin_email' => null]);

        $this->artisan('portfolio:test-email')->assertExitCode(Command::FAILURE);

        Mail::assertNothingSent();
    }

    public function test_command_fails_when_email_delivery_fails(): void
    {
        $this->createAdmin();

        Mail::shouldReceive('to')
            ->once()
            ->andThrow(new \Exception('SMTP no disponible'));

        $this->artisan('portfolio:test-email')->assertExitCode(Command::FAILURE);
    }
}
