DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY NOT NULL,
        nome VARCHAR(50) NOT NULL,
        limite INTEGER NOT NULL,
        saldo INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transacoes (
        id SERIAL PRIMARY KEY NOT NULL,
        tipo CHAR(1) NOT NULL,
        descricao VARCHAR(64),
        valor INTEGER NOT NULL,
        cliente_id INTEGER NOT NULL,
        realizada_em TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY(cliente_id) REFERENCES clientes(id)
    );

    -- Inserção de valores iniciais na tabela clientes
    INSERT INTO clientes (nome, limite, saldo)
    VALUES
        ('Cliente 01', 100000, 0),
        ('Cliente 02', 80000, 0),
        ('Cliente 03', 1000000, 0),
        ('Cliente 04', 10000000, 0),
        ('Cliente 05', 500000, 0);
END $$;