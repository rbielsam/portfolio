<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactMessageTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Ana Visitante',
            'email' => 'ana@example.com',
            'message' => 'Hola, me gustaría saber más sobre tu trabajo.',
            'website' => '',
        ], $overrides);
    }

    public function test_valid_message_is_saved(): void
    {
        $response = $this->postJson('/api/contact/messages', $this->payload());

        $response->assertStatus(201)
            ->assertJsonStructure(['message']);

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Ana Visitante',
            'email' => 'ana@example.com',
        ]);
    }

    public function test_saved_message_defaults_to_unread(): void
    {
        $this->postJson('/api/contact/messages', $this->payload())->assertStatus(201);

        $message = ContactMessage::first();
        $this->assertFalse($message->is_read);
    }

    public function test_message_preserves_line_breaks_and_special_characters(): void
    {
        $text = "Primera línea\nSegunda línea con acentos: áéíóú";

        $this->postJson('/api/contact/messages', $this->payload(['message' => $text]))
            ->assertStatus(201);

        $this->assertDatabaseHas('contact_messages', ['message' => $text]);
    }

    public function test_name_email_and_message_are_required(): void
    {
        $response = $this->postJson('/api/contact/messages', [
            'name' => '',
            'email' => '',
            'message' => '',
            'website' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'message']);

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_invalid_email_is_rejected(): void
    {
        $response = $this->postJson('/api/contact/messages', $this->payload(['email' => 'no-es-un-email']));

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_too_long_message_is_rejected(): void
    {
        $long = str_repeat('a', 5001);

        $response = $this->postJson('/api/contact/messages', $this->payload(['message' => $long]));

        $response->assertStatus(422)->assertJsonValidationErrors(['message']);
        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_message_at_max_length_is_accepted(): void
    {
        $response = $this->postJson('/api/contact/messages', $this->payload([
            'message' => str_repeat('a', 5000),
        ]));

        $response->assertStatus(201);
    }

    public function test_filled_honeypot_is_discarded_silently(): void
    {
        $response = $this->postJson('/api/contact/messages', $this->payload([
            'website' => 'https://spam.example.com',
        ]));

        $response->assertStatus(200);
        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_rate_limit_blocks_more_than_three_submissions(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/contact/messages', $this->payload())->assertStatus(201);
        }

        $response = $this->postJson('/api/contact/messages', $this->payload());

        $response->assertStatus(429);
        $this->assertDatabaseCount('contact_messages', 3);
    }
}
