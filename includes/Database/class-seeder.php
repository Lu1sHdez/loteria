<?php

if (!defined('ABSPATH')) {
    exit;
}


class Juguemos_Seeder
{

    public static function run()
    {

        global $wpdb;
        self::categories($wpdb);
        self::cards($wpdb);
        self::prices($wpdb);

    }


    private static function categories($wpdb)
    {
    
        $table = $wpdb->prefix . 'juguemos_categories';
    
        if (
            $wpdb->get_var(
                "SELECT COUNT(*) FROM $table"
            ) > 0
        ) {
            return;
        }
    
        $categories = [
    
            'Animadas',
    
            'Baby Shower',
    
            'Cómica',
    
            'Despedida de soltera',
    
            'Dulce',
    
            'Elegante',
    
            'Escuela',
    
            'Materiales',
    
            'Personajes',
    
            'Transparente'
    
        ];
    
        $orden = 1;
    
        foreach ($categories as $category) {
    
            $wpdb->insert(
    
                $table,
    
                [
    
                    'nombre' => $category,
    
                    'tipo' => 'baraja',
    
                    'orden' => $orden,
    
                    'activo' => 1
    
                ]
    
            );
    
            $orden++;
    
        }
    
    }
    private static function cards($wpdb)
    {

        $table = $wpdb->prefix . 'juguemos_cards';


        // evitar duplicados
        $exists = $wpdb->get_var(
            "SELECT COUNT(*) FROM $table"
        );


        if ($exists > 0) {
            return;
        }



        $cards = [

            [1,'El Gallo'],
            [2,'El Diablito'],
            [3,'La Dama'],
            [4,'El Catrín'],
            [5,'El Paraguas'],
            [6,'La Sirena'],
            [7,'La Escalera'],
            [8,'La Botella'],
            [9,'El Barril'],
            [10,'El Árbol'],

            [11,'El Melón'],
            [12,'El Valiente'],
            [13,'El Gorrito'],
            [14,'La Muerte'],
            [15,'La Pera'],
            [16,'La Bandera'],
            [17,'El Bandolón'],
            [18,'El Violoncello'],
            [19,'La Garza'],
            [20,'El Pájaro'],

            [21,'La Mano'],
            [22,'La Bota'],
            [23,'La Luna'],
            [24,'El Cotorro'],
            [25,'El Borracho'],
            [26,'El Negrito'],
            [27,'El Corazón'],
            [28,'La Sandía'],
            [29,'El Tambor'],
            [30,'El Camarón'],

            [31,'Las Jaras'],
            [32,'El Músico'],
            [33,'La Araña'],
            [34,'El Soldado'],
            [35,'La Estrella'],
            [36,'El Cazo'],
            [37,'El Mundo'],
            [38,'El Apache'],
            [39,'El Nopal'],
            [40,'El Alacrán'],

            [41,'La Rosa'],
            [42,'La Calavera'],
            [43,'La Campana'],
            [44,'El Cantarito'],
            [45,'El Venado'],
            [46,'El Sol'],
            [47,'La Corona'],
            [48,'La Chalupa'],
            [49,'El Pino'],
            [50,'El Pescado'],

            [51,'La Palma'],
            [52,'La Maceta'],
            [53,'El Arpa'],
            [54,'La Rana'],

        ];



        foreach($cards as $card){


            $wpdb->insert(
                $table,
                [
                    'id'     => $card[0],
                    'nombre' => $card[1]
                ]
            );


        }


    }

    private static function prices($wpdb)
    {

        $table = $wpdb->prefix.'juguemos_prices';


        if(
            $wpdb->get_var(
                "SELECT COUNT(*) FROM $table"
            ) > 0
        ){
            return;
        }



        $prices=[

            [
                'Mexico',
                'MXN',
                'sencilla',
                1.25
            ],

            [
                'Mexico',
                'MXN',
                'dobles',
                1.25
            ],

            [
                'Mexico',
                'MXN',
                'favoritas',
                2
            ],

            [
                'Mexico',
                'MXN',
                'libre',
                2.5
            ],



            [
                'USA',
                'USD',
                'sencilla',
                .30
            ],

            [
                'USA',
                'USD',
                'dobles',
                .30
            ],

            [
                'USA',
                'USD',
                'favoritas',
                .50
            ],

            [
                'USA',
                'USD',
                'libre',
                .50
            ]

        ];



        foreach($prices as $p){

            $wpdb->insert(
                $table,
                [
                    'pais'=>$p[0],
                    'moneda'=>$p[1],
                    'modo'=>$p[2],
                    'precio'=>$p[3]
                ]
            );

        }


    }

}