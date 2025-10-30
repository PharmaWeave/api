import { Address } from "@/branch/models/address";
import { Branch } from "@/branch/models/branch";
import { User } from "@/user/models/user";
import { Product } from "@/product/models/product";
import { ProductInfo } from "@/product/models/product-info";
import { Sale } from "@/sale/models/sale";
import { SaleItem } from "@/sale/models/sale-item";
import { Promotion } from "@/promotion/models/promotion";
import { PromotionProduct } from "@/promotion/models/promo-product";

import {
    CreateProductAndInfoTables,
    CreateUserAndBranchTables,
    CreateSaleAndSaleItemTables,
    CreatePromotionAndPromoProductTables,
    SetPromotionPerSale,
    PromotionPerSaleCanBeNull
} from "@/migrations";

import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOSTNAME,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,

    migrationsRun: true,
    entities: [
        User,
        Branch,
        Address,
        Product,
        ProductInfo,
        Sale,
        SaleItem,
        Promotion,
        PromotionProduct
    ],
    migrations: [
        CreateUserAndBranchTables,
        CreateProductAndInfoTables,
        CreateSaleAndSaleItemTables,
        CreatePromotionAndPromoProductTables,
        SetPromotionPerSale,
        PromotionPerSaleCanBeNull
    ]
});


export async function connect() {
    try {
        await AppDataSource.initialize();
        console.log("Database Connected!");
    } catch (error) {
        console.error("Starting Database Connection: ", error);
    }
}
