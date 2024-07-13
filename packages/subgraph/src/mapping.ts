import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/GamePriceSVG/GamePriceSVG";
import { Token, Owner } from "../generated/schema";
import { GamePriceSVG } from "../generated/GamePriceSVG/GamePriceSVG";
import { Address } from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
  let tokenId = event.params.tokenId.toString();
  let token = Token.load(tokenId);

  if (!token) {
    token = new Token(tokenId);
    token.createdAt = event.block.timestamp;
  }

  let owner = Owner.load(event.params.to.toHex());
  if (!owner) {
    owner = new Owner(event.params.to.toHex());
    owner.address = event.params.to;
    owner.save();
  }

  token.owner = owner.id;
  token.tokenURI = fetchTokenURI(event.address, event.params.tokenId);
  token.save();
}

function fetchTokenURI(contractAddress: Address, tokenId: BigInt): string {
  let contract = GamePriceSVG.bind(contractAddress);
  let tokenURIResult = contract.try_tokenURI(tokenId);
  return tokenURIResult.reverted ? "" : tokenURIResult.value;
}
