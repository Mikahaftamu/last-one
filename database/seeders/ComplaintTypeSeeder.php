<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ComplaintType;

class ComplaintTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Plumbing', 'code' => 'PLUM'],
            ['name' => 'Water', 'code' => 'WATR'],
            ['name' => 'Electricity', 'code' => 'ELEC'],
            ['name' => 'Cleaning', 'code' => 'CLEA'],
            ['name' => 'Other', 'code' => 'OTHR'],
        ];

        foreach ($types as $type) {
            ComplaintType::updateOrCreate(['code' => $type['code']], $type);
        }
    }
} 