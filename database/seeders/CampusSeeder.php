<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Campus;

class CampusSeeder extends Seeder
{
    public function run(): void
    {
        $campuses = [
            ['name' => 'Main', 'code' => 'MAIN'],
            ['name' => 'Adi-Haki', 'code' => 'ADIH'],
            ['name' => 'Arid', 'code' => 'ARID'],
            ['name' => 'Ayder', 'code' => 'AYDR'],
            ['name' => 'Endayesus', 'code' => 'ENDA'],
        ];

        foreach ($campuses as $campus) {
            Campus::updateOrCreate(['code' => $campus['code']], $campus);
        }
    }
} 