import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { keysApi } from '../lib/endpoints';
import { useAuth } from './AuthContext';
import {
  generateKeypair,
  wrapPrivateKey,
  unwrapPrivateKey,
  importPublicKey,
} from '../lib/crypto';

const KeyContext = createContext(null);

export const KeyProvider = ({ children }) => {
  const { user } = useAuth();
  const [keyRecord, setKeyRecord] = useState(null); // server blob
  const [status, setStatus] = useState('idle'); // idle | loading | missing | locked | unlocked
  const [privateKey, setPrivateKey] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  const isPsychologist = user?.role === 'psychologist';

  const refresh = useCallback(async () => {
    if (!isPsychologist) {
      setStatus('idle');
      return;
    }
    setStatus('loading');
    try {
      const res = await keysApi.me();
      if (res.data.data) {
        setKeyRecord(res.data.data);
        setStatus('locked');
      } else {
        setKeyRecord(null);
        setStatus('missing');
      }
    } catch {
      setStatus('missing');
    }
  }, [isPsychologist]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) {
      setPrivateKey(null);
      setPublicKey(null);
      setKeyRecord(null);
      setStatus('idle');
    }
  }, [user]);

  const setup = useCallback(async (passphrase) => {
    const { publicJwk, privateJwk } = await generateKeypair();
    const wrapped = await wrapPrivateKey(privateJwk, passphrase);
    const payload = {
      publicKeyJwk: JSON.stringify(publicJwk),
      ...wrapped,
    };
    const res = await keysApi.setup(payload);
    setKeyRecord(res.data.data);
    const pub = await importPublicKey(publicJwk);
    setPublicKey(pub);
    // derive private key now so user doesn't need to re-enter
    const priv = await unwrapPrivateKey(wrapped, passphrase);
    setPrivateKey(priv);
    setStatus('unlocked');
  }, []);

  const unlock = useCallback(async (passphrase) => {
    if (!keyRecord) throw new Error('Anahtar kaydı bulunamadı');
    const priv = await unwrapPrivateKey(keyRecord, passphrase);
    const pub = await importPublicKey(keyRecord.publicKeyJwk);
    setPrivateKey(priv);
    setPublicKey(pub);
    setStatus('unlocked');
  }, [keyRecord]);

  const lock = useCallback(() => {
    setPrivateKey(null);
    setPublicKey(null);
    if (keyRecord) setStatus('locked');
  }, [keyRecord]);

  const value = useMemo(
    () => ({ status, keyRecord, privateKey, publicKey, refresh, setup, unlock, lock }),
    [status, keyRecord, privateKey, publicKey, refresh, setup, unlock, lock]
  );

  return <KeyContext.Provider value={value}>{children}</KeyContext.Provider>;
};

export const useCryptoKeys = () => {
  const ctx = useContext(KeyContext);
  if (!ctx) throw new Error('useCryptoKeys must be used within KeyProvider');
  return ctx;
};
